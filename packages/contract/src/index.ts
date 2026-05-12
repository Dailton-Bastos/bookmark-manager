import { populateContractRouterPaths } from '@orpc/contract'

import {
	archivedUnarchivedBookmarkContract,
	createBookmarkContract,
	listBookmarksContract
} from './bookmark'

export const contract = populateContractRouterPaths({
	bookmark: {
		create: createBookmarkContract,
		list: listBookmarksContract,
		archiveOrUnarchive: archivedUnarchivedBookmarkContract
	}
})
