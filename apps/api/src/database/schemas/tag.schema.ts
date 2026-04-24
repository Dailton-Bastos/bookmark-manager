import { relations } from 'drizzle-orm'
import {
	integer,
	pgTable,
	serial,
	uniqueIndex,
	varchar
} from 'drizzle-orm/pg-core'
import { timestamps } from '../helpers/columns.helpers'
import { bookmarks } from './bookmark.schema'

export const tags = pgTable('tags', {
	id: serial().primaryKey(),
	name: varchar({ length: 50 }).unique().notNull()
})

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
		uniqueIndex('bookmark_tag_unique_idx').on(table.bookmarkId, table.tagId)
	]
)

export const tagsRelations = relations(tags, ({ many }) => ({
	bookmarkTags: many(bookmarkTags)
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
