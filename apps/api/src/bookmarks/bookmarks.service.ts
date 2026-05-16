import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import type {
	ArchivedUnarchivedBookmark,
	Bookmark,
	CreateBookmark,
	ListBookmarks,
	ListBookmarksArchived,
	ListBookmarksInput,
	PinUnpinBookmark,
	VisitedBookmark
} from '@repo/schemas'
import type { SQL } from 'drizzle-orm'
import { and, count, desc, eq, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { schema } from '../database/schemas'
import { PaginationProvider } from '../pagination/pagination.provider'
import { LISTBOOKMARKS_CACHE_KEY } from '../shared/constants/cache'
import { DATABASE_CONNECTION } from '../shared/constants/database'
import { TagsService } from '../tags/tags.service'

@Injectable()
export class BookmarksService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		private readonly db: NodePgDatabase<typeof schema>,
		private readonly tagsService: TagsService,
		private readonly paginationProvider: PaginationProvider,
		@Inject(CACHE_MANAGER) private cacheManager: Cache
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
			await this.invalidateOwnerCache(ownerId)
		}

		return result
	}

	private async invalidateOwnerCache(ownerId: string): Promise<void> {
		const registryKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_keys`
		const cachedKeys = await this.cacheManager.get<string[]>(registryKey)

		if (cachedKeys && cachedKeys.length > 0) {
			await Promise.all(cachedKeys.map((key) => this.cacheManager.del(key)))
			await this.cacheManager.del(registryKey)
		}
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

		const cachedResult = await this.cacheManager.get<ListBookmarks>(cacheKey)

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
						desc(schema.bookmarks.createdAt),
						desc(schema.bookmarks.id)
					]
			}

			const bookmarks = await tx
				.select()
				.from(schema.bookmarks)
				.where(whereClause)
				.limit(limit)
				.offset(offset)
				.orderBy(
					// When non-archived bookmarks may appear in the result, sort pinned bookmarks first; for archived-only view, sort by updatedAt to show most recently archived first
					desc(
						archived !== 'only'
							? schema.bookmarks.pinned
							: schema.bookmarks.updatedAt
					),
					...orderByClauses
				)

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

		await this.registerAndCacheResult(cacheKey, ownerId, result)

		return result
	}

	private async registerAndCacheResult(
		cacheKey: string,
		ownerId: string,
		result: ListBookmarks
	): Promise<void> {
		const registryKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_keys`

		// Read the registry before caching to minimise the window for concurrent
		// writes to miss each other's keys (best-effort; not fully atomic).
		const existingKeys =
			(await this.cacheManager.get<string[]>(registryKey)) ?? []

		await this.cacheManager.set(cacheKey, result)

		if (!existingKeys.includes(cacheKey)) {
			await this.cacheManager.set(registryKey, [...existingKeys, cacheKey])
		}
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
			.set({ isArchived })
			.where(
				and(eq(schema.bookmarks.id, id), eq(schema.bookmarks.ownerId, ownerId))
			)
			.returning()

		if (!updatedBookmark?.[0]) return null

		// Invalidate this owner's bookmark list cache entries after archiving/unarchiving a bookmark
		await this.invalidateOwnerCache(ownerId)

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
		await this.invalidateOwnerCache(ownerId)

		return {
			...updatedBookmark[0],
			tags: existingBookmark.tags
		}
	}

	async visited(
		input: VisitedBookmark,
		ownerId: string
	): Promise<Bookmark | null> {
		const { id, lastVisited } = input

		const existingBookmark = await this.findById(id, ownerId)

		if (!existingBookmark) return null

		const isValidDate =
			lastVisited instanceof Date && !Number.isNaN(lastVisited.getTime())

		// If lastVisited is invalid, skip updating and just return the existing bookmark
		if (!isValidDate) return existingBookmark

		const now = new Date()

		// Prevent setting a future date as lastVisited
		const visitDate = lastVisited > now ? now : lastVisited

		const updatedBookmark = await this.db
			.update(schema.bookmarks)
			.set({
				lastVisited: visitDate,
				visitCount: existingBookmark.visitCount + 1
			})
			.where(
				and(eq(schema.bookmarks.id, id), eq(schema.bookmarks.ownerId, ownerId))
			)
			.returning()

		if (!updatedBookmark?.[0]) return null

		await this.invalidateOwnerCache(ownerId)

		return {
			...updatedBookmark[0],
			tags: existingBookmark.tags
		}
	}
}
