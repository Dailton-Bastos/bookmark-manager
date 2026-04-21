import { createORPCClient } from '@orpc/client'
import type { ContractRouterClient } from '@orpc/contract'
import type { JsonifiedClient } from '@orpc/openapi-client'
import { OpenAPILink } from '@orpc/openapi-client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { contract } from '@repo/contract'

const link = new OpenAPILink(contract, {
	url: () => {
		if (typeof window === 'undefined') {
			throw new Error('OpenAPILink is not allowed on the server side.')
		}

		return `${window.location.origin}/api`
	},
	fetch: (request, init) => {
		return globalThis.fetch(request, {
			...init,
			credentials: 'include'
		})
	},
	interceptors: []
})

const client: JsonifiedClient<ContractRouterClient<typeof contract>> =
	createORPCClient(link)

export const orpcClient = createTanstackQueryUtils(client)
