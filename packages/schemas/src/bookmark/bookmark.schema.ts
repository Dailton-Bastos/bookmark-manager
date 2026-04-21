import z from 'zod'

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
	ownerId: z.string()
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
	})
})

export type Bookmark = z.infer<typeof bookmarkSchema>
export type CreateBookmark = z.infer<typeof createBookmarkSchema>
