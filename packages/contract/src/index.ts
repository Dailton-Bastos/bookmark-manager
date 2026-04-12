import { populateContractRouterPaths } from '@orpc/contract'

import { createBookmarkContract } from './bookmark'

export const contract = populateContractRouterPaths({
	bookmark: {
		create: createBookmarkContract
	}
})
