import { Inject, Injectable } from '@nestjs/common'
import type { CreateBookmark } from '@repo/schemas'
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
}
