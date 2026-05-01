import { oc } from '@orpc/contract'
import {
	bookmarkSchema,
	createBookmarkSchema,
	listBookmarksInputSchema,
	listBookmarksSchema
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
