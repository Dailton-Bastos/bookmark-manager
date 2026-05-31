import { oc } from '@orpc/contract'
import {
	archivedUnarchivedBookmarkSchema,
	bookmarkSchema,
	createBookmarkSchema,
	deleteBookmarkOutputSchema,
	deleteBookmarkSchema,
	listBookmarksInputSchema,
	listBookmarksSchema,
	pinUnpinBookmarkSchema,
	searchBookmarksInputSchema,
	updateBookmarkSchema,
	visitedBookmarkSchema
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

export const visitedBookmarkContract = oc
	.route({
		method: 'PATCH',
		path: '/bookmarks/visit',
		summary: 'Update the last visited timestamp of a bookmark',
		tags: ['Bookmarks']
	})
	.input(visitedBookmarkSchema)
	.output(bookmarkSchema)

export const deleteBookmarkContract = oc
	.route({
		method: 'DELETE',
		path: '/bookmarks',
		summary: 'Delete a bookmark',
		tags: ['Bookmarks']
	})
	.input(deleteBookmarkSchema)
	.output(deleteBookmarkOutputSchema)

export const updateBookmarkContract = oc
	.route({
		method: 'PATCH',
		path: '/bookmarks/update',
		summary: 'Update a bookmark',
		tags: ['Bookmarks']
	})
	.input(updateBookmarkSchema)
	.output(bookmarkSchema)

export const searchBookmarksContract = oc
	.route({
		method: 'GET',
		path: '/bookmarks/search',
		summary: 'Search bookmarks',
		tags: ['Bookmarks']
	})
	.input(searchBookmarksInputSchema)
	.output(listBookmarksSchema)
