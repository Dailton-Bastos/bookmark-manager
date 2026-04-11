import z from 'zod'

export const BookmarkSchema = z.object({
	id: z.number(),
	title: z.string(),
	description: z.string().optional(),
	url: z.url(),
	pinned: z.boolean(),
	isArchived: z.boolean(),
	visitCount: z.number(),
	createdAt: z.string(),
	lastVisited: z.string().optional()
})

export const CreateBookmarkSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().optional(),
	url: z.url({
		protocol: /^https?$/,
		message: 'URL must be a valid HTTP or HTTPS URL'
	})
})

export type Bookmark = z.infer<typeof BookmarkSchema>
export type CreateBookmark = z.infer<typeof CreateBookmarkSchema>
