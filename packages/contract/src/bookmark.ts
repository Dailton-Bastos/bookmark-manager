import { oc } from '@orpc/contract'
import { bookmarkSchema, createBookmarkSchema } from '@repo/schemas'

export const createBookmarkContract = oc
	.route({
		method: 'POST',
		path: '/bookmarks',
		summary: 'Create a new bookmark',
		tags: ['Bookmarks']
	})
	.input(createBookmarkSchema)
	.output(bookmarkSchema)
