import { Inject, Injectable } from '@nestjs/common'
import type {
	ArchivedUnarchivedBookmark,
	Bookmark,
	CreateBookmark,
	DeleteBookmark,
	ListBookmarks,
	ListBookmarksArchived,
	ListBookmarksInput,
	PinUnpinBookmark,
	SearchBookmarks,
	UpdateBookmark,
	VisitedBookmark
} from '@repo/schemas'
import type { SQL } from 'drizzle-orm'
import { and, count, desc, eq, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { CacheProvider } from '../cache/cache.provider'
import { schema } from '../database/schemas'
import { PaginationProvider } from '../pagination/pagination.provider'
import {
	LISTBOOKMARKS_CACHE_KEY,
	LISTTAGS_CACHE_KEY
} from '../shared/constants/cache'
import { DATABASE_CONNECTION } from '../shared/constants/database'
import { TagsService } from '../tags/tags.service'

@Injectable()
export class BookmarksService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		private readonly db: NodePgDatabase<typeof schema>,
		private readonly tagsService: TagsService,
		private readonly paginationProvider: PaginationProvider,
		private readonly cacheProvider: CacheProvider
	) {}

	async create(createBookmarkInput: CreateBookmark, ownerId: string) {
		const { title, description, url, tags } = createBookmarkInput

		const result = await this.db.transaction(async (tx) => {
			const [bookmark] = await tx
				.insert(schema.bookmarks)
				.values({
					title,
					description,
					url,
					ownerId
				})
				.returning()

			if (!bookmark) return null

			if (!tags || tags.length === 0) {
				return { ...bookmark, tags: [] }
			}

			const uniqueTags = [...new Set(tags)]

			const createdTags = await Promise.all(
				uniqueTags.map((tag) =>
					this.tagsService.create(
						{ name: tag },
						tx as unknown as NodePgDatabase<typeof schema>
					)
				)
			)

			const validTags = createdTags.filter(
				(tag): tag is NonNullable<typeof tag> => tag !== null
			)

			if (validTags.length === 0) {
				return { ...bookmark, tags: [] }
			}

			await tx
				.insert(schema.bookmarkTags)
				.values(
					validTags.map((tag) => ({ bookmarkId: bookmark.id, tagId: tag.id }))
				)

			return { ...bookmark, tags: validTags }
		})

		// Invalidate only this owner's bookmark list cache entries after the transaction commits
		if (result !== null) {
			const registryKey = this.cacheProvider.generateRegistryKey({
				ownerId,
				cacheKey: LISTBOOKMARKS_CACHE_KEY
			})

			await this.cacheProvider.invalidateOwnerCache({ registryKey })

			if (result.tags.length > 0) {
				const tagRegistryKey = this.cacheProvider.generateRegistryKey({
					ownerId,
					cacheKey: LISTTAGS_CACHE_KEY
				})

				await this.cacheProvider.invalidateOwnerCache({
					registryKey: tagRegistryKey
				})
			}
		}

		return result
	}

	async list(
		{
			limit,
			page,
			order,
			archived = 'include'
		}: Omit<ListBookmarksInput, 'archived'> & {
			archived?: ListBookmarksArchived
		},
		ownerId: string
	): Promise<ListBookmarks> {
		const cacheKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_${page}_${limit}_${order}_${archived}`

		const cachedResult = await this.cacheProvider.get<ListBookmarks>(cacheKey)

		if (cachedResult) return cachedResult

		let whereClause: SQL | undefined

		switch (archived) {
			case 'include':
				whereClause = eq(schema.bookmarks.ownerId, ownerId) // No filter on archived status
				break
			case 'only':
				whereClause = and(
					eq(schema.bookmarks.ownerId, ownerId),
					eq(schema.bookmarks.isArchived, true) // Only archived bookmarks
				)
				break
			default:
				whereClause = and(
					eq(schema.bookmarks.ownerId, ownerId),
					eq(schema.bookmarks.isArchived, false) // Exclude archived bookmarks
				)
		}

		const result = await this.db.transaction(async (tx) => {
			const bookmarksTotalCount = await tx
				.select({ bookmarksCount: count() })
				.from(schema.bookmarks)
				.where(whereClause)
				.groupBy(schema.bookmarks.ownerId)

			if (!bookmarksTotalCount || bookmarksTotalCount.length === 0) {
				return this.paginationProvider.paginateQuery<Bookmark>({
					paginationQuery: { page, limit },
					data: [],
					totalCount: 0
				})
			}

			const { bookmarksCount } = bookmarksTotalCount[0] || { bookmarksCount: 0 }

			const offset = (page - 1) * limit

			let orderByClauses: SQL[]

			switch (order) {
				case 'recently_visited':
					orderByClauses = [
						sql`${schema.bookmarks.lastVisited} DESC NULLS LAST`,
						desc(schema.bookmarks.id)
					]
					break
				case 'most_visited':
					orderByClauses = [
						desc(schema.bookmarks.visitCount),
						desc(schema.bookmarks.id)
					]
					break
				default:
					orderByClauses = [
						archived === 'only'
							? sql`${schema.bookmarks.archivedAt} DESC NULLS LAST`
							: sql`${schema.bookmarks.createdAt} DESC NULLS LAST`,
						desc(schema.bookmarks.id)
					]
			}

			// When non-archived bookmarks may appear in the result, sort pinned bookmarks first
			const orderBy =
				archived === 'only'
					? orderByClauses
					: [sql`${schema.bookmarks.pinned} DESC`, ...orderByClauses]

			const bookmarks = await tx
				.select()
				.from(schema.bookmarks)
				.where(whereClause)
				.limit(limit)
				.offset(offset)
				.orderBy(...orderBy)

			if (bookmarks.length === 0) {
				return this.paginationProvider.paginateQuery<Bookmark>({
					paginationQuery: { page, limit },
					data: [],
					totalCount: 0
				})
			}

			const bookmarkIds = bookmarks.map((bookmark) => bookmark.id)

			const tagsByBookmarkId = await this.tagsService.findByBookmarkIds(
				bookmarkIds,
				tx as unknown as NodePgDatabase<typeof schema>
			)

			return this.paginationProvider.paginateQuery<Bookmark>({
				paginationQuery: { page, limit },
				data: bookmarks.map((bookmark) => ({
					...bookmark,
					tags: tagsByBookmarkId[bookmark.id] || []
				})),
				totalCount: bookmarksCount
			})
		})

		const registryKey = this.cacheProvider.generateRegistryKey({
			ownerId,
			cacheKey: LISTBOOKMARKS_CACHE_KEY
		})

		await this.cacheProvider.registerAndCacheResult({
			registryKey,
			cacheKey,
			result
		})

		return result
	}

	async search(
		{ query, limit, page, order }: SearchBookmarks,
		ownerId: string
	): Promise<ListBookmarks> {
		const cacheKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_${page}_${limit}_${order}_search_${query}`

		const cachedResult = await this.cacheProvider.get<ListBookmarks>(cacheKey)

		if (cachedResult) return cachedResult

		/*
			To match the full-text search query against both title and description (multiple keywords), we concatenate them with a space in between and create a tsvector for that.
			We also use plainto_tsquery to parse the search query, which will handle things like stemming and ignoring stop words.
		*/
		const result = await this.db.transaction(async (tx) => {
			const searchVector = sql`setweight(to_tsvector('english', coalesce(${schema.bookmarks.title}, '')), 'A') || setweight(to_tsvector('english', coalesce(${schema.bookmarks.description}, '')), 'B')`

			const bookmarksTotalCount = await tx
				.select({ bookmarksCount: count() })
				.from(schema.bookmarks)
				.where(
					and(
						eq(schema.bookmarks.ownerId, ownerId),
						sql`${searchVector} @@ plainto_tsquery('english', ${query})`
					)
				)

			const bookmarksCount = bookmarksTotalCount[0]?.bookmarksCount ?? 0

			if (bookmarksCount === 0) {
				return this.paginationProvider.paginateQuery<Bookmark>({
					paginationQuery: { page, limit },
					data: [],
					totalCount: 0
				})
			}

			const offset = (page - 1) * limit

			let orderByClauses: SQL[]

			switch (order) {
				case 'recently_visited':
					orderByClauses = [
						sql`${schema.bookmarks.lastVisited} DESC NULLS LAST`,
						desc(schema.bookmarks.id)
					]
					break
				case 'most_visited':
					orderByClauses = [
						desc(schema.bookmarks.visitCount),
						desc(schema.bookmarks.id)
					]
					break
				default:
					orderByClauses = [
						desc(schema.bookmarks.createdAt),
						desc(schema.bookmarks.id)
					]
			}

			const bookmarks = await tx
				.select()
				.from(schema.bookmarks)
				.where(
					and(
						eq(schema.bookmarks.ownerId, ownerId),
						sql`${searchVector} @@ plainto_tsquery('english', ${query})`
					)
				)
				.orderBy(...orderByClauses)
				.limit(limit)
				.offset(offset)

			const bookmarkIds = bookmarks.map((bookmark) => bookmark.id)

			const tagsByBookmarkId = await this.tagsService.findByBookmarkIds(
				bookmarkIds,
				tx as unknown as NodePgDatabase<typeof schema>
			)

			return this.paginationProvider.paginateQuery<Bookmark>({
				paginationQuery: { page, limit },
				data: bookmarks.map((bookmark) => ({
					...bookmark,
					tags: tagsByBookmarkId[bookmark.id] || []
				})),
				totalCount: bookmarksCount
			})
		})

		const registryKey = this.cacheProvider.generateRegistryKey({
			ownerId,
			cacheKey: LISTBOOKMARKS_CACHE_KEY
		})

		await this.cacheProvider.registerAndCacheResult({
			registryKey,
			cacheKey,
			result
		})

		return result
	}

	async findById(id: number, ownerId: string): Promise<Bookmark | null> {
		const bookmark = await this.db.query.bookmarks.findFirst({
			where: and(
				eq(schema.bookmarks.id, id),
				eq(schema.bookmarks.ownerId, ownerId)
			)
		})

		if (!bookmark) return null

		const tags = await this.tagsService.findByBookmarkIds([id], this.db)

		return {
			...bookmark,
			tags: tags[id] || []
		}
	}

	async archiveOrUnarchive(
		input: ArchivedUnarchivedBookmark,
		ownerId: string
	): Promise<Bookmark | null> {
		const { id, isArchived } = input

		const existingBookmark = await this.findById(id, ownerId)

		if (!existingBookmark) return null

		const updatedBookmark = await this.db
			.update(schema.bookmarks)
			.set({ isArchived, archivedAt: isArchived ? new Date() : null })
			.where(
				and(eq(schema.bookmarks.id, id), eq(schema.bookmarks.ownerId, ownerId))
			)
			.returning()

		if (!updatedBookmark?.[0]) return null

		// Invalidate this owner's bookmark list cache entries after archiving/unarchiving a bookmark
		const registryKey = this.cacheProvider.generateRegistryKey({
			ownerId,
			cacheKey: LISTBOOKMARKS_CACHE_KEY
		})

		await this.cacheProvider.invalidateOwnerCache({ registryKey })

		return {
			...updatedBookmark[0],
			tags: existingBookmark.tags
		}
	}

	async pinOrUnpin(
		input: PinUnpinBookmark,
		ownerId: string
	): Promise<Bookmark | null> {
		const { id, pinned } = input

		const existingBookmark = await this.findById(id, ownerId)

		if (!existingBookmark) return null

		const updatedBookmark = await this.db
			.update(schema.bookmarks)
			.set({ pinned })
			.where(
				and(eq(schema.bookmarks.id, id), eq(schema.bookmarks.ownerId, ownerId))
			)
			.returning()

		if (!updatedBookmark?.[0]) return null

		// Invalidate this owner's bookmark list cache entries after pinning/unpinning a bookmark
		const registryKey = this.cacheProvider.generateRegistryKey({
			ownerId,
			cacheKey: LISTBOOKMARKS_CACHE_KEY
		})

		await this.cacheProvider.invalidateOwnerCache({ registryKey })

		return {
			...updatedBookmark[0],
			tags: existingBookmark.tags
		}
	}

	async visited(
		input: VisitedBookmark,
		ownerId: string
	): Promise<Bookmark | null> {
		const { id } = input

		const existingBookmark = await this.findById(id, ownerId)

		if (!existingBookmark) return null

		const updatedBookmark = await this.db
			.update(schema.bookmarks)
			.set({
				lastVisited: new Date(),
				visitCount: sql`${schema.bookmarks.visitCount} + 1`
			})
			.where(
				and(eq(schema.bookmarks.id, id), eq(schema.bookmarks.ownerId, ownerId))
			)
			.returning()

		if (!updatedBookmark?.[0]) return null

		const registryKey = this.cacheProvider.generateRegistryKey({
			ownerId,
			cacheKey: LISTBOOKMARKS_CACHE_KEY
		})

		await this.cacheProvider.invalidateOwnerCache({ registryKey })

		return {
			...updatedBookmark[0],
			tags: existingBookmark.tags
		}
	}

	async delete(
		input: DeleteBookmark,
		ownerId: string
	): Promise<undefined | null> {
		const { id } = input
		const existingBookmark = await this.findById(id, ownerId)

		if (!existingBookmark) return null

		await this.db
			.delete(schema.bookmarks)
			.where(
				and(eq(schema.bookmarks.id, id), eq(schema.bookmarks.ownerId, ownerId))
			)

		const bookmarkRegistryKey = this.cacheProvider.generateRegistryKey({
			ownerId,
			cacheKey: LISTBOOKMARKS_CACHE_KEY
		})

		const tagRegistryKey = this.cacheProvider.generateRegistryKey({
			ownerId,
			cacheKey: LISTTAGS_CACHE_KEY
		})

		await Promise.all([
			this.cacheProvider.invalidateOwnerCache({
				registryKey: bookmarkRegistryKey
			}),
			this.cacheProvider.invalidateOwnerCache({ registryKey: tagRegistryKey })
		])
	}

	async update(
		input: UpdateBookmark,
		ownerId: string
	): Promise<Bookmark | null> {
		const { id, title, description, url, tags } = input

		if (!id) return null

		const existingBookmark = await this.findById(id, ownerId)

		if (!existingBookmark) return null

		const result = await this.db.transaction(async (tx) => {
			const updatedBookmark = await tx
				.update(schema.bookmarks)
				.set({ title, description, url })
				.where(
					and(
						eq(schema.bookmarks.id, id),
						eq(schema.bookmarks.ownerId, ownerId)
					)
				)
				.returning()

			if (!updatedBookmark?.[0]) return null

			if (tags !== undefined) {
				await tx
					.delete(schema.bookmarkTags)
					.where(eq(schema.bookmarkTags.bookmarkId, id))

				const uniqueTags = [...new Set(tags)]

				const createdTags = await Promise.all(
					uniqueTags.map((tag) =>
						this.tagsService.create(
							{ name: tag },
							tx as unknown as NodePgDatabase<typeof schema>
						)
					)
				)

				const validTags = createdTags.filter(
					(tag): tag is NonNullable<typeof tag> => tag !== null
				)

				if (validTags.length > 0) {
					await tx
						.insert(schema.bookmarkTags)
						.values(validTags.map((tag) => ({ bookmarkId: id, tagId: tag.id })))
				}

				return { ...updatedBookmark[0], tags: validTags }
			}

			return { ...updatedBookmark[0], tags: existingBookmark.tags }
		})

		const registryKey = this.cacheProvider.generateRegistryKey({
			ownerId,
			cacheKey: LISTBOOKMARKS_CACHE_KEY
		})

		await this.cacheProvider.invalidateOwnerCache({ registryKey })

		if (result !== null && input.tags !== undefined) {
			const tagRegistryKey = this.cacheProvider.generateRegistryKey({
				ownerId,
				cacheKey: LISTTAGS_CACHE_KEY
			})

			await this.cacheProvider.invalidateOwnerCache({
				registryKey: tagRegistryKey
			})
		}

		return result
	}
}
