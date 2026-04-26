import { describe, expect, it } from '@jest/globals'
import { ZodError } from 'zod'
import { bookmarkSchema, createBookmarkSchema } from './bookmark.schema'

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
			pinned: false,
			isArchived: false,
			visitCount: 0,
			createdAt: new Date('2024-06-01T10:00:00.000Z'),
			updatedAt: new Date('2020-01-01T06:15:00.123Z'),
			lastVisited: null,
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
			url: 'https://example.com',
			pinned: false,
			isArchived: false,
			visitCount: 0,
			createdAt: new Date('2024-06-01T10:00:00.000Z'),
			updatedAt: new Date('2024-06-01T10:00:00.000Z'),
			lastVisited: null,
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
			url: 'https://example.com',
			pinned: false,
			isArchived: false,
			visitCount: 0,
			createdAt: new Date('2024-06-01T10:00:00.000Z'),
			updatedAt: new Date('2024-06-01T10:00:00.000Z'),
			lastVisited: null,
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
