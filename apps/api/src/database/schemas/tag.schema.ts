import { relations } from 'drizzle-orm'
import {
	index,
	integer,
	pgTable,
	serial,
	uniqueIndex,
	varchar
} from 'drizzle-orm/pg-core'
import { timestamps } from '../helpers/columns.helpers'
import { bookmarks } from './bookmark.schema'

export const tags = pgTable(
	'tags',
	{
		id: serial().primaryKey(),
		name: varchar({ length: 50 }).unique().notNull()
	},
	(table) => [uniqueIndex('name_idx').on(table.name)]
)

export const bookmarkTags = pgTable(
	'bookmark_tags',
	{
		id: serial().primaryKey(),
		bookmarkId: integer('bookmark_id')
			.notNull()
			.references(() => bookmarks.id, { onDelete: 'cascade' }),
		tagId: integer('tag_id')
			.notNull()
			.references(() => tags.id, { onDelete: 'cascade' }),
		...timestamps
	},
	(table) => [
		index('bookmarkId_idx').on(table.bookmarkId),
		index('tagId_idx').on(table.tagId)
	]
)

export const tagsRelations = relations(tags, ({ many }) => ({
	bookmarks: many(bookmarkTags)
}))

export const bookmarkTagsRelations = relations(bookmarkTags, ({ one }) => ({
	bookmark: one(bookmarks, {
		fields: [bookmarkTags.bookmarkId],
		references: [bookmarks.id]
	}),
	tag: one(tags, {
		fields: [bookmarkTags.tagId],
		references: [tags.id]
	})
}))
