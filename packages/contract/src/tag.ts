import { oc } from '@orpc/contract'
import { listTagsSchema, paginationQuerySchema } from '@repo/schemas'

export const listTagsContract = oc
	.route({
		method: 'GET',
		path: '/tags',
		summary: 'List tags with pagination',
		tags: ['Tags']
	})
	.input(paginationQuerySchema)
	.output(listTagsSchema)
