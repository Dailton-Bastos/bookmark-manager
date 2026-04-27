import z from 'zod'

export const paginationQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(10)
})

export const paginationMetaSchema = z.object({
	itemsPerPage: z.number().int().positive().max(100).default(10),
	currentPage: z.number().int().positive(),
	totalItems: z.number().nonnegative(),
	totalPages: z.number().nonnegative(),
	hasNextPage: z.boolean(),
	hasPreviousPage: z.boolean()
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>
export type PaginationMeta = z.infer<typeof paginationMetaSchema>
