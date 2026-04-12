import { oc } from '@orpc/contract'
import { BookmarkSchema, CreateBookmarkSchema } from '@repo/schemas'

export const createBookmarkContract = oc
	.route({
		method: 'POST',
		path: '/bookmarks',
		summary: 'Create a new bookmark',
		tags: ['Bookmarks']
	})
	.input(CreateBookmarkSchema)
	.output(BookmarkSchema)
