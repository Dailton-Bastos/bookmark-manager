import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import type {
	Bookmark,
	CreateBookmark,
	ListBookmarks,
	ListBookmarksInput,
	Tag
} from '@repo/schemas'
import { asc, count, desc, eq, inArray } from 'drizzle-orm'
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
		}

		await this.cacheManager.del(registryKey)
	}

	async list(
		{ limit, page, order }: ListBookmarksInput,
		ownerId: string
	): Promise<ListBookmarks> {
		const cacheKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_${page}_${limit}_${order}`

		const cachedResult = await this.cacheManager.get<ListBookmarks>(cacheKey)

		if (cachedResult) return cachedResult

		const result = await this.db.transaction(async (tx) => {
			const bookmarksTotalCount = await tx
				.select({ bookmarksCount: count() })
				.from(schema.bookmarks)
				.where(eq(schema.bookmarks.ownerId, ownerId))

			if (!bookmarksTotalCount || bookmarksTotalCount.length === 0) {
				return this.paginationProvider.paginateQuery<Bookmark>({
					paginationQuery: { page, limit },
					data: [],
					totalCount: 0
				})
			}

			const { bookmarksCount } = bookmarksTotalCount[0] || { bookmarksCount: 0 }

			const offset = (page - 1) * limit

			const bookmarks = await tx
				.select()
				.from(schema.bookmarks)
				.where(eq(schema.bookmarks.ownerId, ownerId))
				.limit(limit)
				.offset(offset)
				.orderBy(
					order === 'asc'
						? asc(schema.bookmarks.createdAt)
						: desc(schema.bookmarks.createdAt)
				)

			if (bookmarks.length === 0) {
				return this.paginationProvider.paginateQuery<Bookmark>({
					paginationQuery: { page, limit },
					data: [],
					totalCount: 0
				})
			}

			const bookmarkIds = bookmarks.map((bookmark) => bookmark.id)

			const bookmarkTags = await tx
				.select({
					bookmarkId: schema.bookmarkTags.bookmarkId,
					tag: schema.tags
				})
				.from(schema.bookmarkTags)
				.leftJoin(schema.tags, eq(schema.tags.id, schema.bookmarkTags.tagId))
				.where(inArray(schema.bookmarkTags.bookmarkId, bookmarkIds))

			const tagsByBookmarkId: Record<number, Tag[]> = {}

			for (const { bookmarkId, tag } of bookmarkTags) {
				if (!tagsByBookmarkId[bookmarkId]) {
					tagsByBookmarkId[bookmarkId] = []
				}

				if (!tag) continue

				tagsByBookmarkId[bookmarkId].push(tag)
			}

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

		await this.cacheManager.set(cacheKey, result)

		const existingKeys =
			(await this.cacheManager.get<string[]>(registryKey)) ?? []

		if (!existingKeys.includes(cacheKey)) {
			await this.cacheManager.set(registryKey, [...existingKeys, cacheKey])
		}
	}
}
