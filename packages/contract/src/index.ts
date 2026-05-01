import { populateContractRouterPaths } from '@orpc/contract'

import { createBookmarkContract, listBookmarksContract } from './bookmark'

export const contract = populateContractRouterPaths({
	bookmark: {
		create: createBookmarkContract,
		list: listBookmarksContract
	}
})
