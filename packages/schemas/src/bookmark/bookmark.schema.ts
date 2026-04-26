import z from 'zod'
import { tagSchema } from '../tag/tag.schema'

export const bookmarkSchema = z.object({
	id: z.number(),
	title: z.string(),
	description: z.string().nullable(),
	url: z.url(),
	pinned: z.boolean(),
	isArchived: z.boolean(),
	visitCount: z.number(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	lastVisited: z.coerce.date().nullable(),
	ownerId: z.string(),
	tags: z.array(tagSchema).nullish().default([])
})

export const createBookmarkSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z
		.string()
		.max(280, 'Description must be at most 280 characters')
		.nullish(),
	url: z.url({
		protocol: /^https?$/,
		message: 'URL must be a valid HTTP or HTTPS URL'
	}),
	tags: z
		.array(
			z
				.string()
				.min(1, 'Tag name cannot be empty')
				.max(50, 'Tag name must be at most 50 characters')
		)
		.max(10, 'You can add up to 10 tags')
		.nullish()
})

export type Bookmark = z.infer<typeof bookmarkSchema>
export type CreateBookmark = z.infer<typeof createBookmarkSchema>
