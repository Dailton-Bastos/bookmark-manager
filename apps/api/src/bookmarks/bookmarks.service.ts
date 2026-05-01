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
import { DATABASE_CONNECTION } from '../shared/constants/database'
import { TagsService } from '../tags/tags.service'

@Injectable()
export class BookmarksService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		private readonly db: NodePgDatabase<typeof schema>,
		private readonly tagsService: TagsService,
		private readonly paginationProvider: PaginationProvider
	) {}

	async create(createBookmarkInput: CreateBookmark, ownerId: string) {
		const { title, description, url, tags } = createBookmarkInput

		return await this.db.transaction(async (tx) => {
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
				return {
					...bookmark,
					tags: []
				}
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
				return {
					...bookmark,
					tags: []
				}
			}

			await tx
				.insert(schema.bookmarkTags)
				.values(
					validTags.map((tag) => ({ bookmarkId: bookmark.id, tagId: tag.id }))
				)

			return {
				...bookmark,
				tags: validTags
			}
		})
	}

	async list(
		{ limit, page, order }: ListBookmarksInput,
		ownerId: string
	): Promise<ListBookmarks> {
		return this.db.transaction(async (tx) => {
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
	}
}
