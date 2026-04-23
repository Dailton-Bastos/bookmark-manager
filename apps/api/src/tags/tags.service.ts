import { Inject, Injectable } from '@nestjs/common'
import type { CreateTag } from '@repo/schemas'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { schema } from '../database/schemas'
import { DATABASE_CONNECTION } from '../shared/constants/database'

@Injectable()
export class TagsService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		private readonly db: NodePgDatabase<typeof schema>
	) {}

	async create(createTagInput: CreateTag) {
		const { name } = createTagInput

		const [tag] = await this.db
			.insert(schema.tags)
			.values({ name })
			.onConflictDoUpdate({
				target: schema.tags.name,
				set: { name: schema.tags.name }
			})
			.returning()

		if (!tag) return null

		return tag
	}
}
