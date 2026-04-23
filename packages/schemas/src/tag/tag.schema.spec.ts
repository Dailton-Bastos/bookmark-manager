import { describe, expect, it } from '@jest/globals'
import { ZodError } from 'zod'
import { createTagSchema, tagSchema } from './tag.schema'

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
})
