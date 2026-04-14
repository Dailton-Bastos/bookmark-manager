import { Inject, Injectable } from '@nestjs/common'
import type { CreateBookmark } from '@repo/schemas'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { schema } from '../database/schemas'
import { DATABASE_CONNECTION } from '../shared/constants/database'

@Injectable()
export class BookmarksService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		private readonly db: NodePgDatabase<typeof schema>
	) {}

	async create(createBookmarkInput: CreateBookmark, ownerId: string) {
		const { title, description, url } = createBookmarkInput

		const [bookmark] = await this.db
			.insert(schema.bookmarks)
			.values({
				title,
				description,
				url,
				ownerId
			})
			.returning()

		return bookmark
	}
}
