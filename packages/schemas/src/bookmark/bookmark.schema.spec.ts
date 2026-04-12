import { ZodError } from 'zod'
import { BookmarkSchema, CreateBookmarkSchema } from './bookmark.schema'

describe('BookmarkSchema', () => {
	it('should be defined', () => {
		expect(BookmarkSchema).toBeDefined()
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
			createdAt: new Date().toISOString(),
			lastVisited: ''
		}

		const result = BookmarkSchema.safeParse(validBookmark)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.id).toBe(1)
			expect(result.data.title).toBe('Example Bookmark')
			expect(result.data.url).toBe('https://example.com')
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
			createdAt: 'invalid-date'
		}

		const result = BookmarkSchema.safeParse(invalidBookmark)

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
			expect(result.error.issues.length).toBeGreaterThan(0)
		}
	})
})

describe('CreateBookmarkSchema', () => {
	it('should be defined', () => {
		expect(CreateBookmarkSchema).toBeDefined()
	})

	it('should validate a valid create bookmark object', () => {
		const validCreateBookmark = {
			title: 'Example Bookmark',
			description: 'This is an example bookmark.',
			url: 'https://example.com'
		}

		const result = CreateBookmarkSchema.safeParse(validCreateBookmark)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.title).toBe('Example Bookmark')
			expect(result.data.url).toBe('https://example.com')
		}
	})

	it('should fail validation for an invalid create bookmark object', () => {
		const invalidCreateBookmark = {
			title: '',
			url: 'invalid-url'
		}

		const result = CreateBookmarkSchema.safeParse(invalidCreateBookmark)

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
