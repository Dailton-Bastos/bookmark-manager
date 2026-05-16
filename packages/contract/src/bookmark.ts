import { oc } from '@orpc/contract'
import {
	archivedUnarchivedBookmarkSchema,
	bookmarkSchema,
	createBookmarkSchema,
	listBookmarksInputSchema,
	listBookmarksSchema,
	pinUnpinBookmarkSchema
} from '@repo/schemas'

export const createBookmarkContract = oc
	.route({
		method: 'POST',
		path: '/bookmarks',
		summary: 'Create a new bookmark',
		tags: ['Bookmarks']
	})
	.input(createBookmarkSchema)
	.output(bookmarkSchema)

export const listBookmarksContract = oc
	.route({
		method: 'GET',
		path: '/bookmarks',
		summary: 'List bookmarks with pagination',
		tags: ['Bookmarks']
	})
	.input(listBookmarksInputSchema)
	.output(listBookmarksSchema)

export const archivedUnarchivedBookmarkContract = oc
	.route({
		method: 'PATCH',
		path: '/bookmarks/archive',
		summary: 'Archive or unarchive a bookmark',
		tags: ['Bookmarks']
	})
	.input(archivedUnarchivedBookmarkSchema)
	.output(bookmarkSchema)

export const pinUnpinBookmarkContract = oc
	.route({
		method: 'PATCH',
		path: '/bookmarks/pin',
		summary: 'Pin or unpin a bookmark',
		tags: ['Bookmarks']
	})
	.input(pinUnpinBookmarkSchema)
	.output(bookmarkSchema)
