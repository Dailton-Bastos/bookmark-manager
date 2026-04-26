import { Inject, Injectable } from '@nestjs/common'
import type { CreateBookmark, ListBookmarks, Tag } from '@repo/schemas'
import { eq, inArray } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { schema } from '../database/schemas'
import { DATABASE_CONNECTION } from '../shared/constants/database'
import { TagsService } from '../tags/tags.service'

@Injectable()
export class BookmarksService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		private readonly db: NodePgDatabase<typeof schema>,
		private readonly tagsService: TagsService
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
		{ limit }: { limit: number },
		ownerId: string
	): Promise<ListBookmarks> {
		const bookmarks = await this.db
			.select()
			.from(schema.bookmarks)
			.where(eq(schema.bookmarks.ownerId, ownerId))
			.limit(limit)

		const bookmarkIds = bookmarks.map((bookmark) => bookmark.id)

		const bookmarkTags = await this.db
			.select({ bookmarkId: schema.bookmarkTags.bookmarkId, tag: schema.tags })
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

		return bookmarks.map((bookmark) => ({
			...bookmark,
			tags: tagsByBookmarkId[bookmark.id] || []
		}))
	}
}
