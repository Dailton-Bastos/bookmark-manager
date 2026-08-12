import { describe, expect, it } from '@jest/globals'
import { ZodError } from 'zod'
import type { ListBookmarks, ListBookmarksInput } from './bookmark.schema'
import {
	archivedUnarchivedBookmarkSchema,
	bookmarkMetadataSchema,
	bookmarkSchema,
	createBookmarkSchema,
	deleteBookmarkOutputSchema,
	getBookmarkMetadataInputSchema,
	listBookmarksInputSchema,
	listBookmarksSchema,
	listBookmarksTaggedInputSchema,
	pinUnpinBookmarkSchema,
	visitedBookmarkSchema
} from './bookmark.schema'

describe('BookmarkSchema', () => {
	it('should be defined', () => {
		expect(bookmarkSchema).toBeDefined()
	})

	it('should validate a valid bookmark object', () => {
		const validBookmark = {
			id: 1,
			title: 'Example Bookmark',
			description: 'This is an example bookmark.',
			url: 'https://example.com',
			favicon: '/assets/images/favicon.png',
			pinned: false,
			isArchived: false,
			visitCount: 0,
			createdAt: new Date('2024-06-01T10:00:00.000Z'),
			updatedAt: new Date('2020-01-01T06:15:00.123Z'),
			lastVisited: null,
			archivedAt: null,
			ownerId: 'user-123',
			tags: [
				{ id: 1, name: 'example' },
				{ id: 2, name: 'bookmark' }
			]
		}

		const result = bookmarkSchema.safeParse(validBookmark)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.id).toBe(1)
			expect(result.data.title).toBe('Example Bookmark')
			expect(result.data.url).toBe('https://example.com')
			expect(result.data.createdAt).toBeInstanceOf(Date)
			expect(result.data.updatedAt).toBeInstanceOf(Date)
			expect(result.data.lastVisited).toBeNull()
			expect(result.data.ownerId).toBe('user-123')
			expect(result.data.tags).toEqual([
				{ id: 1, name: 'example' },
				{ id: 2, name: 'bookmark' }
			])
		}
	})

	it('should default tags to an empty array when tags is omitted', () => {
		const bookmarkWithoutTags = {
			id: 1,
			title: 'Example Bookmark',
			description: null,
			favicon: null,
			url: 'https://example.com',
			pinned: false,
			isArchived: false,
			visitCount: 0,
			createdAt: new Date('2024-06-01T10:00:00.000Z'),
			updatedAt: new Date('2024-06-01T10:00:00.000Z'),
			lastVisited: null,
			archivedAt: null,
			ownerId: 'user-123'
		}

		const result = bookmarkSchema.safeParse(bookmarkWithoutTags)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.tags).toEqual([])
		}
	})

	it('should allow tags to be null', () => {
		const bookmarkWithNullTags = {
			id: 1,
			title: 'Example Bookmark',
			description: null,
			favicon: null,
			url: 'https://example.com',
			pinned: false,
			isArchived: false,
			visitCount: 0,
			createdAt: new Date('2024-06-01T10:00:00.000Z'),
			updatedAt: new Date('2024-06-01T10:00:00.000Z'),
			lastVisited: null,
			archivedAt: null,
			ownerId: 'user-123',
			tags: null
		}

		const result = bookmarkSchema.safeParse(bookmarkWithNullTags)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.tags).toBeNull()
		}
	})

	it('should fail validation for an invalid bookmark object', () => {
		const invalidBookmark = {
			id: 'not-a-number',
			title: '',
			url: 'invalid-url',
			pinned: 'not-a-boolean',
			isArchived: 'not-a-boolean',
			visitCount: 'not-a-number',
			createdAt: 'invalid-date',
			lastVisited: '2020-01-01T06:15:00+02:00'
		}

		const result = bookmarkSchema.safeParse(invalidBookmark)

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
			expect(result.error.issues.length).toBeGreaterThan(0)
		}
	})
})

describe('CreateBookmarkSchema', () => {
	it('should be defined', () => {
		expect(createBookmarkSchema).toBeDefined()
	})

	it('should validate a valid create bookmark object', () => {
		const validCreateBookmark = {
			title: 'Example Bookmark',
			description: 'This is an example bookmark.',
			favicon: null,
			url: 'https://example.com',
			tags: ['example', 'bookmark']
		}

		const result = createBookmarkSchema.safeParse(validCreateBookmark)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.title).toBe('Example Bookmark')
			expect(result.data.url).toBe('https://example.com')
			expect(result.data.tags).toEqual(['example', 'bookmark'])
		}
	})

	it('should allow tags to be omitted (nullish)', () => {
		const bookmarkWithoutTags = {
			title: 'Example Bookmark',
			favicon: null,
			description: 'This is an example bookmark.',
			url: 'https://example.com'
		}

		const result = createBookmarkSchema.safeParse(bookmarkWithoutTags)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.tags).toBeUndefined()
		}
	})

	it('should allow tags to be null (nullish)', () => {
		const bookmarkWithNullTags = {
			title: 'Example Bookmark',
			description: 'This is an example bookmark.',
			favicon: null,
			url: 'https://example.com',
			tags: null
		}

		const result = createBookmarkSchema.safeParse(bookmarkWithNullTags)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.tags).toBeNull()
		}
	})

	it('should fail validation for an invalid create bookmark object', () => {
		const invalidCreateBookmark = {
			title: '',
			url: 'invalid-url'
		}

		const result = createBookmarkSchema.safeParse(invalidCreateBookmark)

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
			expect(result.error.issues.length).toBeGreaterThan(0)

			const titleIssue = result.error.issues.find(
				(issue) => issue.path[0] === 'title'
			)
			const urlIssue = result.error.issues.find(
				(issue) => issue.path[0] === 'url'
			)

			expect(titleIssue).toBeDefined()
			expect(urlIssue).toBeDefined()
			expect(titleIssue?.code).toBe('too_small')
			expect(urlIssue?.code).toBe('invalid_format')
		}
	})
})

describe('ListBookmarksInputSchema', () => {
	it('should be defined', () => {
		expect(listBookmarksInputSchema).toBeDefined()
	})

	it('should validate a valid list bookmarks input object', () => {
		const validInput: ListBookmarksInput = {
			page: 1,
			limit: 10,
			order: 'desc',
			archived: 'exclude'
		}

		const result = listBookmarksInputSchema.safeParse(validInput)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.page).toBe(1)
			expect(result.data.limit).toBe(10)
			expect(result.data.order).toBe('desc')
			expect(result.data.archived).toBe('exclude')
		}
	})

	it('should default archived to include when omitted', () => {
		const result = listBookmarksInputSchema.safeParse({
			page: 1,
			limit: 10,
			order: 'desc'
		})

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.archived).toBe('include')
		}
	})
})

describe('ListBookmarksTaggedInputSchema', () => {
	it('should accept a single tag value and normalize it to an array', () => {
		const result = listBookmarksTaggedInputSchema.safeParse({
			page: 1,
			limit: 10,
			order: 'desc',
			tags: '1'
		})

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.tags).toEqual([1])
		}
	})
})

describe('ListBookmarksSchema', () => {
	it('should be defined', () => {
		expect(listBookmarksSchema).toBeDefined()
	})

	it('should validate a valid list bookmarks object', () => {
		const validListBookmarks: ListBookmarks = {
			data: [
				{
					id: 1,
					title: 'Example Bookmark',
					description: 'This is an example bookmark.',
					favicon: null,
					url: 'https://example.com',
					pinned: false,
					isArchived: false,
					visitCount: 0,
					createdAt: new Date('2024-06-01T10:00:00.000Z'),
					updatedAt: new Date('2024-06-01T10:00:00.000Z'),
					lastVisited: null,
					archivedAt: null,
					ownerId: 'user-123',
					tags: [
						{ id: 1, name: 'example' },
						{ id: 2, name: 'bookmark' }
					]
				}
			],
			meta: {
				itemsPerPage: 10,
				currentPage: 1,
				totalItems: 1,
				totalPages: 1,
				hasNextPage: false,
				hasPreviousPage: false
			}
		}

		const result = listBookmarksSchema.safeParse(validListBookmarks)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.data.length).toBe(1)
			expect(result.data.meta.currentPage).toBe(1)
			expect(result.data.meta.totalItems).toBe(1)
		}
	})

	it('should fail validation for an invalid list bookmarks object', () => {
		const invalidListBookmarks = {
			data: [
				{
					id: 'not-a-number',
					title: '',
					url: 'invalid-url',
					pinned: 'not-a-boolean',
					isArchived: 'not-a-boolean',
					visitCount: 'not-a-number',
					createdAt: 'invalid-date',
					lastVisited: '2020-01-01T06:15:00+02:00'
				}
			],
			meta: {
				itemsPerPage: -1,
				currentPage: 0,
				totalItems: -5,
				totalPages: -1,
				hasNextPage: 'not-a-boolean',
				hasPreviousPage: 'not-a-boolean'
			}
		}

		const result = listBookmarksSchema.safeParse(invalidListBookmarks)

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
			expect(result.error.issues.length).toBeGreaterThan(0)
		}
	})
})

describe('ArchivedUnarchivedBookmarkSchema', () => {
	it('should be defined', () => {
		expect(archivedUnarchivedBookmarkSchema).toBeDefined()
	})

	it('should validate a valid archived/unarchived bookmark object', () => {
		const validInput = {
			id: 1,
			isArchived: true
		}

		const result = archivedUnarchivedBookmarkSchema.safeParse(validInput)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.id).toBe(1)
			expect(result.data.isArchived).toBe(true)
		}
	})

	it('should fail validation for an invalid archived/unarchived bookmark object', () => {
		const invalidInput = {
			id: 'not-a-number',
			isArchived: 'not-a-boolean'
		}

		const result = archivedUnarchivedBookmarkSchema.safeParse(invalidInput)

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
			expect(result.error.issues.length).toBeGreaterThan(0)
		}
	})
})

describe('PinUnpinBookmarkSchema', () => {
	it('should be defined', () => {
		expect(pinUnpinBookmarkSchema).toBeDefined()
	})

	it('should validate a valid pin/unpin bookmark object', () => {
		const validInput = {
			id: 1,
			pinned: true
		}

		const result = pinUnpinBookmarkSchema.safeParse(validInput)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.id).toBe(1)
			expect(result.data.pinned).toBe(true)
		}
	})

	it('should fail validation for an invalid pin/unpin bookmark object', () => {
		const invalidInput = {
			id: 'not-a-number',
			pinned: 'not-a-boolean'
		}

		const result = pinUnpinBookmarkSchema.safeParse(invalidInput)

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
			expect(result.error.issues.length).toBeGreaterThan(0)
		}
	})
})

describe('VisitedBookmarkSchema', () => {
	it('should be defined', () => {
		expect(visitedBookmarkSchema).toBeDefined()
	})

	it('should validate a valid visited bookmark object', () => {
		const validInput = {
			id: 1
		}

		const result = visitedBookmarkSchema.safeParse(validInput)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.id).toBe(1)
		}
	})

	it('should fail validation for an invalid visited bookmark object', () => {
		const invalidInput = {
			id: 'not-a-number'
		}

		const result = visitedBookmarkSchema.safeParse(invalidInput)

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
			expect(result.error.issues.length).toBeGreaterThan(0)
		}
	})
})

describe('DeleteBookmarkOutputSchema', () => {
	it('should be defined', () => {
		expect(deleteBookmarkOutputSchema).toBeDefined()
	})

	it('should validate a valid delete bookmark output object', () => {
		const validOutput = {
			success: true
		}

		const result = deleteBookmarkOutputSchema.safeParse(validOutput)

		expect(result.success).toBe(true)
	})

	it('should fail validation for an invalid delete bookmark output object', () => {
		const invalidOutput = {
			success: 'not-a-boolean'
		}

		const result = deleteBookmarkOutputSchema.safeParse(invalidOutput)

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
			expect(result.error.issues.length).toBeGreaterThan(0)
		}
	})
})

describe('GetBookmarkMetadataInputSchema', () => {
	it('should be defined', () => {
		expect(getBookmarkMetadataInputSchema).toBeDefined()
	})

	it('should validate a valid get bookmark metadata input object', () => {
		const validInput = {
			url: 'https://example.com',
			theme: 'light'
		}

		const result = getBookmarkMetadataInputSchema.safeParse(validInput)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.url).toBe('https://example.com')
			expect(result.data.theme).toBe('light')
		}
	})

	it('should fail validation for an invalid get bookmark metadata input object', () => {
		const invalidInput = {
			url: 'invalid-url',
			theme: 'invalid-theme'
		}

		const result = getBookmarkMetadataInputSchema.safeParse(invalidInput)

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
			expect(result.error.issues.length).toBeGreaterThan(0)
		}
	})
})

describe('BookmarkMetadata', () => {
	it('should validate a valid bookmark metadata object', () => {
		const validMetadata = {
			title: 'Example Title',
			description: 'This is an example description.',
			favicon: 'https://example.com/favicon.ico'
		}

		const result = bookmarkMetadataSchema.safeParse(validMetadata)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.title).toBe('Example Title')
			expect(result.data.description).toBe('This is an example description.')
			expect(result.data.favicon).toBe('https://example.com/favicon.ico')
		}
	})

	it('should fail validation for an invalid bookmark metadata object', () => {
		const invalidMetadata = {
			title: '',
			description: 123,
			favicon: 'invalid-url'
		}

		const result = bookmarkMetadataSchema.safeParse(invalidMetadata)

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
			expect(result.error.issues.length).toBeGreaterThan(0)
		}
	})
})
