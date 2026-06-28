import { describe, expect, it } from '@jest/globals'
import { ZodError } from 'zod'
import { createTagSchema, listTagsSchema, tagSchema } from './tag.schema'

describe('TagSchema', () => {
	it('should be defined', () => {
		expect(tagSchema).toBeDefined()
	})

	it('should validate a valid tag object', () => {
		const validTag = {
			id: 1,
			name: 'Example Tag'
		}

		const result = tagSchema.safeParse(validTag)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data.id).toBe(1)
			expect(result.data.name).toBe('Example Tag')
		}
	})

	it('should fail validation for an invalid tag object', () => {
		const invalidTag = {
			id: 'not-a-number',
			name: ''
		}

		const result = tagSchema.safeParse(invalidTag)

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
			expect(result.error.issues.length).toBeGreaterThan(0)
		}
	})

	describe('CreateTagSchema', () => {
		it('should be defined', () => {
			expect(createTagSchema).toBeDefined()
		})

		it('should validate a valid create tag object', () => {
			const validCreateTag = {
				name: 'New Tag'
			}

			const result = createTagSchema.safeParse(validCreateTag)

			expect(result.success).toBe(true)

			if (result.success) {
				expect(result.data.name).toBe('New Tag')
			}
		})

		it('should fail validation for an invalid create tag object', () => {
			const invalidCreateTag = {
				name: ''
			}

			const result = createTagSchema.safeParse(invalidCreateTag)

			expect(result.success).toBe(false)

			if (!result.success) {
				expect(result.error).toBeInstanceOf(ZodError)
				expect(result.error.issues.length).toBeGreaterThan(0)

				const nameIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'name'
				)

				expect(nameIssue).toBeDefined()
				expect(nameIssue?.code).toBe('too_small')
			}
		})

		it('should fail validation for a create tag object with a name that is too long', () => {
			const invalidCreateTag = {
				name: 'A'.repeat(51) // 51 characters, exceeding the max length of 50
			}

			const result = createTagSchema.safeParse(invalidCreateTag)

			expect(result.success).toBe(false)

			if (!result.success) {
				expect(result.error).toBeInstanceOf(ZodError)
				expect(result.error.issues.length).toBeGreaterThan(0)

				const nameIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'name'
				)

				expect(nameIssue).toBeDefined()
				expect(nameIssue?.code).toBe('too_big')
			}
		})
	})

	describe('ListTagsSchema', () => {
		it('should validate a valid list tags object', () => {
			const validListTags = {
				data: [
					{ id: 1, name: 'Tag 1', bookmarkCount: 5 },
					{ id: 2, name: 'Tag 2', bookmarkCount: 3 }
				],
				meta: {
					itemsPerPage: 10,
					currentPage: 1,
					totalItems: 2,
					totalPages: 1,
					hasNextPage: false,
					hasPreviousPage: false
				}
			}

			const result = listTagsSchema.safeParse(validListTags)

			expect(result.success).toBe(true)

			if (result.success) {
				expect(result.data.data.length).toBe(2)
				expect(result.data.meta.currentPage).toBe(1)
				expect(result.data.meta.totalPages).toBe(1)
				expect(result.data.meta.hasNextPage).toBe(false)
				expect(result.data.meta.hasPreviousPage).toBe(false)
			}
		})

		it('should fail validation for an invalid list tags object', () => {
			const invalidListTags = {
				data: [
					{ id: 1, name: 'Tag 1', bookmarkCount: 5 },
					{ id: 2, name: 'Tag 2', bookmarkCount: 3 }
				],
				meta: {
					itemsPerPage: 10,
					currentPage: 1,
					totalItems: 2,
					totalPages: 1
					// Missing hasNextPage and hasPreviousPage
				}
			}

			const result = listTagsSchema.safeParse(invalidListTags)

			expect(result.success).toBe(false)

			if (!result.success) {
				expect(result.error).toBeInstanceOf(ZodError)
				expect(result.error.issues.length).toBeGreaterThan(0)

				const hasNextPageIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'meta' && issue.path[1] === 'hasNextPage'
				)

				const hasPreviousPageIssue = result.error.issues.find(
					(issue) =>
						issue.path[0] === 'meta' && issue.path[1] === 'hasPreviousPage'
				)

				expect(hasNextPageIssue).toBeDefined()
				expect(hasNextPageIssue?.code).toBe('invalid_type')

				expect(hasPreviousPageIssue).toBeDefined()
				expect(hasPreviousPageIssue?.code).toBe('invalid_type')
			}
		})
	})
})
