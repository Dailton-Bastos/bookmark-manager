import { populateContractRouterPaths } from '@orpc/contract'

import {
	archivedUnarchivedBookmarkContract,
	createBookmarkContract,
	deleteBookmarkContract,
	getUrlMetadataContract,
	listBookmarksContract,
	listBookmarksTaggedContract,
	pinUnpinBookmarkContract,
	searchBookmarksContract,
	updateBookmarkContract,
	visitedBookmarkContract
} from './bookmark'
import { listTagsContract } from './tag'
import { uploadContract } from './upload'
import {
	getUserProfileContract,
	requestPasswordResetContract,
	resetPasswordContract,
	updateUserPasswordContract,
	updateUserProfileContract
} from './user'

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
		tagged: listBookmarksTaggedContract,
		metadata: getUrlMetadataContract
	},
	tag: {
		list: listTagsContract
	},
	upload: {
		image: uploadContract
	},
	user: {
		getProfile: getUserProfileContract,
		updateProfile: updateUserProfileContract,
		updatePassword: updateUserPasswordContract,
		requestPasswordReset: requestPasswordResetContract,
		resetPassword: resetPasswordContract
	}
})
