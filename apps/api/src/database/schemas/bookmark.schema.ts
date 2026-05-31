import { relations, sql } from 'drizzle-orm'
import {
	boolean,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp
} from 'drizzle-orm/pg-core'
import { timestamps } from '../helpers/columns.helpers'
import { users } from './auth.schema'
import { bookmarkTags } from './tag.schema'

export const bookmarks = pgTable(
	'bookmarks',
	{
		id: serial().primaryKey(),
		title: text().notNull(),
		description: text(),
		url: text().notNull(),
		pinned: boolean().notNull().default(false),
		isArchived: boolean('is_archived').notNull().default(false),
		visitCount: integer('visit_count').notNull().default(0),
		lastVisited: timestamp('last_visited'),
		archivedAt: timestamp('archived_at'),
		ownerId: text('owner_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		...timestamps
	},
	(table) => [
		index('title_idx').on(table.title),
		index('ownerId_idx').on(table.ownerId),
		index('lastVisited_idx').on(table.lastVisited),
		index('visitCount_idx').on(table.visitCount),
		index('search_index').using(
			'gin',
			sql`(
				setweight(to_tsvector('english', coalesce(${table.title}, '')), 'A') ||
				setweight(to_tsvector('english', coalesce(${table.description}, '')), 'B')
			)`
		)
	]
)

export const bookmarksRelations = relations(bookmarks, ({ one, many }) => ({
	owner: one(users, {
		fields: [bookmarks.ownerId],
		references: [users.id]
	}),
	tags: many(bookmarkTags)
}))
