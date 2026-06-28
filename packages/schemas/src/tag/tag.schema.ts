import z from 'zod'
import { paginationMetaSchema } from '../pagination/pagination.schema'

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

export const tagWithBookmarkCountSchema = z.object({
	...tagSchema.shape,
	bookmarkCount: z.number()
})

export const listTagsSchema = z.object({
	data: z.array(tagWithBookmarkCountSchema),
	meta: paginationMetaSchema
})

export type Tag = z.infer<typeof tagSchema>
export type CreateTag = z.infer<typeof createTagSchema>
export type ListTags = z.infer<typeof listTagsSchema>
export type TagWithBookmarkCount = z.infer<typeof tagWithBookmarkCountSchema>
