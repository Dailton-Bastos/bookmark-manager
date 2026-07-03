import { populateContractRouterPaths } from '@orpc/contract'

import {
	archivedUnarchivedBookmarkContract,
	createBookmarkContract,
	deleteBookmarkContract,
	listBookmarksContract,
	listBookmarksTaggedContract,
	pinUnpinBookmarkContract,
	searchBookmarksContract,
	updateBookmarkContract,
	visitedBookmarkContract
} from './bookmark'
import { listTagsContract } from './tag'

export const contract = populateContractRouterPaths({
	bookmark: {
		create: createBookmarkContract,
		list: listBookmarksContract,
		archiveOrUnarchive: archivedUnarchivedBookmarkContract,
		pinOrUnpin: pinUnpinBookmarkContract,
		visited: visitedBookmarkContract,
		delete: deleteBookmarkContract,
		update: updateBookmarkContract,
		search: searchBookmarksContract,
		tagged: listBookmarksTaggedContract
	},
	tag: {
		list: listTagsContract
	}
})
