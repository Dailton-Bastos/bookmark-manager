import z from 'zod'
import {
	paginationMetaSchema,
	paginationQuerySchema
} from '../pagination/pagination.schema'
import { tagSchema } from '../tag/tag.schema'

export const bookmarkSchema = z.object({
	id: z.number(),
	title: z.string(),
	description: z.string().nullable(),
	favicon: z.string().nullable(),
	url: z.url(),
	pinned: z.boolean(),
	isArchived: z.boolean(),
	visitCount: z.number(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	lastVisited: z.coerce.date().nullable(),
	archivedAt: z.coerce.date().nullable(),
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
	favicon: z.string().nullish(),
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

export const updateBookmarkSchema = createBookmarkSchema.partial().extend({
	id: z.coerce.number<number>().int().positive()
})

export const listBookmarksInputSchema = paginationQuerySchema.extend({
	order: z.enum(['desc', 'recently_visited', 'most_visited']).default('desc'),
	archived: z.enum(['include', 'exclude', 'only']).default('include')
})

export const listBookmarksTaggedInputSchema = listBookmarksInputSchema
	.extend({
		tags: z
			.preprocess(
				(value) => {
					if (value === undefined || value === null) return value
					return Array.isArray(value) ? value : [value]
				},
				z
					.array(z.coerce.number<number>().int().positive())
					.min(1, 'At least one tag is required')
			)
			.describe(
				'Tag IDs. Returns bookmarks that match at least one of these tags.'
			)
	})
	.omit({ archived: true })

export const listBookmarksSchema = z.object({
	data: z.array(bookmarkSchema),
	meta: paginationMetaSchema
})

export const archivedUnarchivedBookmarkSchema = z.object({
	id: z.coerce.number().int().positive(),
	isArchived: z.boolean()
})

export const pinUnpinBookmarkSchema = z.object({
	id: z.coerce.number().int().positive(),
	pinned: z.boolean()
})

export const visitedBookmarkSchema = z.object({
	id: z.coerce.number().int().positive()
})

export const deleteBookmarkSchema = z.object({
	id: z.coerce.number().int().positive()
})

export const deleteBookmarkOutputSchema = z.object({
	success: z.boolean()
})

export const searchBookmarksInputSchema = paginationQuerySchema.extend({
	query: z.string().min(1, 'Search query cannot be empty'),
	order: z.enum(['desc', 'recently_visited', 'most_visited']).default('desc')
})

export const getBookmarkMetadataInputSchema = z.object({
	url: z.url({
		protocol: /^https?$/,
		message: 'URL must be a valid HTTP or HTTPS URL'
	})
})

export const bookmarkMetadataSchema = z.object({
	title: z.string(),
	description: z.string().nullable(),
	favicon: z.string().nullable()
})

export type BookmarkMetadata = z.infer<typeof bookmarkMetadataSchema>
export type Bookmark = z.infer<typeof bookmarkSchema>
export type CreateBookmark = z.infer<typeof createBookmarkSchema>
export type UpdateBookmark = z.infer<typeof updateBookmarkSchema>
export type ListBookmarks = z.infer<typeof listBookmarksSchema>
export type ListBookmarksInput = z.infer<typeof listBookmarksInputSchema>
export type ListBookmarksTaggedInput = z.infer<
	typeof listBookmarksTaggedInputSchema
>
export type ArchivedUnarchivedBookmark = z.infer<
	typeof archivedUnarchivedBookmarkSchema
>
export type PinUnpinBookmark = z.infer<typeof pinUnpinBookmarkSchema>
export type VisitedBookmark = z.infer<typeof visitedBookmarkSchema>
export type DeleteBookmark = z.infer<typeof deleteBookmarkSchema>
export type ListBookmarksOrder = ListBookmarksInput['order']
export type ListBookmarksArchived = ListBookmarksInput['archived']
export type BookmarkFormData = Omit<CreateBookmark, 'tags'> & {
	tags: string[]
}
export type SearchBookmarks = z.infer<typeof searchBookmarksInputSchema>
