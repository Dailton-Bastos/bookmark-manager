import { populateContractRouterPaths } from '@orpc/contract'

import {
	archivedUnarchivedBookmarkContract,
	createBookmarkContract,
	listBookmarksContract,
	pinUnpinBookmarkContract
} from './bookmark'

export const contract = populateContractRouterPaths({
	bookmark: {
		create: createBookmarkContract,
		list: listBookmarksContract,
		archiveOrUnarchive: archivedUnarchivedBookmarkContract,
		pinOrUnpin: pinUnpinBookmarkContract
	}
})
