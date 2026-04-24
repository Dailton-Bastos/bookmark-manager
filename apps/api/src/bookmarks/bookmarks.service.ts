import {
	Inject,
	Injectable,
	InternalServerErrorException
} from '@nestjs/common'
import type { CreateBookmark } from '@repo/schemas'
import { eq } from 'drizzle-orm'
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

		const [bookmark] = await this.db
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

		const validTags = await this.createBookmarkTags(bookmark.id, tags)

		return {
			...bookmark,
			tags: validTags
		}
	}

	private async createBookmarkTags(bookmarkId: number, tags: string[]) {
		try {
			const createdTags = await Promise.all(
				tags.map((tag) => this.tagsService.create({ name: tag }))
			)

			const validTags = createdTags.filter(
				(tag): tag is NonNullable<typeof tag> => tag !== null
			)

			if (validTags.length === 0) return []

			await this.db
				.insert(schema.bookmarkTags)
				.values(validTags.map((tag) => ({ bookmarkId, tagId: tag.id })))

			return validTags
		} catch (error) {
			await this.db
				.delete(schema.bookmarks)
				.where(eq(schema.bookmarks.id, bookmarkId))

			throw new InternalServerErrorException('Failed to create bookmark tags', {
				cause: error instanceof Error ? error : undefined
			})
		}
	}
}
