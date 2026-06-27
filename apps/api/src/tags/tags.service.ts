import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import type {
	CreateTag,
	ListTags,
	PaginationQuery,
	Tag,
	TagWithBookmarkCount
} from '@repo/schemas'
import { count, countDistinct, desc, eq, inArray } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { schema } from '../database/schemas'
import { PaginationProvider } from '../pagination/pagination.provider'
import { LISTTAGS_CACHE_KEY } from '../shared/constants/cache'
import { DATABASE_CONNECTION } from '../shared/constants/database'

@Injectable()
export class TagsService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		private readonly db: NodePgDatabase<typeof schema>,
		private readonly paginationProvider: PaginationProvider,
		@Inject(CACHE_MANAGER) private cacheManager: Cache
	) {}

	async create(
		createTagInput: CreateTag,
		db: NodePgDatabase<typeof schema> = this.db
	) {
		const { name } = createTagInput

		const [tag] = await db
			.insert(schema.tags)
			.values({ name })
			.onConflictDoUpdate({
				target: schema.tags.name,
				set: { name }
			})
			.returning()

		if (!tag) return null

		return tag
	}

	async findByBookmarkIds(
		bookmarkIds: number[],
		db: NodePgDatabase<typeof schema> = this.db
	): Promise<{ [bookmarkId: number]: Tag[] }> {
		const bookmarkTags = await db
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

		return tagsByBookmarkId
	}

	async list(
		{ limit, page }: PaginationQuery,
		ownerId: string
	): Promise<ListTags> {
		const cacheKey = `${LISTTAGS_CACHE_KEY}_${ownerId}_${page}_${limit}`

		const cachedResult = await this.cacheManager.get<ListTags>(cacheKey)

		if (cachedResult) return cachedResult

		const result = await this.db.transaction(async (tx) => {
			const tagsTotalCount = await tx
				.select({
					uniqueTagsCount: countDistinct(schema.tags.id)
				})
				.from(schema.bookmarkTags)
				.leftJoin(schema.tags, eq(schema.tags.id, schema.bookmarkTags.tagId))
				.leftJoin(
					schema.bookmarks,
					eq(schema.bookmarks.id, schema.bookmarkTags.bookmarkId)
				)
				.where(eq(schema.bookmarks.ownerId, ownerId))

			if (!tagsTotalCount || tagsTotalCount.length === 0) {
				return this.paginationProvider.paginateQuery<TagWithBookmarkCount>({
					paginationQuery: { page, limit },
					data: [],
					totalCount: 0
				})
			}

			const { uniqueTagsCount } = tagsTotalCount[0] || { uniqueTagsCount: 0 }

			// Get the tags AND their counts in a single query
			const tagsWithCounts = await tx
				.select({
					id: schema.tags.id,
					name: schema.tags.name,
					// SQL count aggregation handles the mapping automatically
					bookmarkCount: count(schema.bookmarkTags.bookmarkId)
				})
				.from(schema.bookmarkTags)
				.leftJoin(schema.tags, eq(schema.tags.id, schema.bookmarkTags.tagId))
				.leftJoin(
					schema.bookmarks,
					eq(schema.bookmarks.id, schema.bookmarkTags.bookmarkId)
				)
				.where(eq(schema.bookmarks.ownerId, ownerId))
				.groupBy(schema.tags.id, schema.tags.name) // Grouping allows accurate counts
				.limit(limit)
				.offset((page - 1) * limit)
				.orderBy(desc(schema.tags.id))

			const data = tagsWithCounts
				.filter((item) => item.id !== null)
				.map((item) => ({
					id: item.id as number,
					name: item.name as string,
					bookmarkCount: item.bookmarkCount as number
				}))

			return this.paginationProvider.paginateQuery<TagWithBookmarkCount>({
				paginationQuery: { page, limit },
				data,
				totalCount: uniqueTagsCount
			})
		})

		return result
	}
}
