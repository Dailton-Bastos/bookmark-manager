import { Inject, Injectable } from '@nestjs/common'
import type { CreateTag, Tag } from '@repo/schemas'
import { eq, inArray } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { schema } from '../database/schemas'
import { DATABASE_CONNECTION } from '../shared/constants/database'

@Injectable()
export class TagsService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		private readonly db: NodePgDatabase<typeof schema>
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
		bookmarkIds: number[]
	): Promise<{ [bookmarkId: number]: Tag[] }> {
		const bookmarkTags = await this.db
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
}
