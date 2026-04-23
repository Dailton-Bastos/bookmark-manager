import z from 'zod'

export const tagSchema = z.object({
	id: z.number(),
	name: z.string()
})

export const createTagSchema = z.object({
	name: z
		.string()
		.min(1, 'Tag name is required')
		.max(50, 'Tag name must be at most 50 characters')
})

export type Tag = z.infer<typeof tagSchema>
export type CreateTag = z.infer<typeof createTagSchema>
