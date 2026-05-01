import { describe, expect, it } from '@jest/globals'
import { ZodError } from 'zod'
import type { PaginationMeta, PaginationQuery } from './pagination.schema'
import {
	paginationMetaSchema,
	paginationQuerySchema
} from './pagination.schema'

describe('Pagination Schemas', () => {
	it('should be defined', () => {
		expect(paginationMetaSchema).toBeDefined()
		expect(paginationQuerySchema).toBeDefined()
	})

	describe('paginationQuerySchema', () => {
		it('should validate a valid pagination query', () => {
			const validQuery: PaginationQuery = {
				page: 2,
				limit: 20
			}

			const result = paginationQuerySchema.safeParse(validQuery)

			expect(result.success).toBe(true)

			if (result.success) {
				expect(result.data.page).toBe(2)
				expect(result.data.limit).toBe(20)
			}
		})

		it('should apply default values for pagination query', () => {
			const result = paginationQuerySchema.safeParse({})

			expect(result.success).toBe(true)

			if (result.success) {
				expect(result.data.page).toBe(1)
				expect(result.data.limit).toBe(10)
			}
		})

		it('should fail validation for invalid pagination query', () => {
			const invalidQuery = {
				page: -1,
				limit: 0
			}

			const result = paginationQuerySchema.safeParse(invalidQuery)

			expect(result.success).toBe(false)

			if (!result.success) {
				expect(result.error).toBeInstanceOf(ZodError)
				expect(result.error.issues.length).toBeGreaterThan(0)

				const pageIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'page'
				)
				const limitIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'limit'
				)

				expect(pageIssue).toBeDefined()
				expect(limitIssue).toBeDefined()
				expect(pageIssue?.code).toBe('too_small')
				expect(limitIssue?.code).toBe('too_small')
			}
		})
	})

	describe('paginationMetaSchema', () => {
		it('should validate a valid pagination meta', () => {
			const validMeta: PaginationMeta = {
				itemsPerPage: 20,
				currentPage: 2,
				totalItems: 100,
				totalPages: 5,
				hasNextPage: true,
				hasPreviousPage: true
			}

			const result = paginationMetaSchema.safeParse(validMeta)

			expect(result.success).toBe(true)

			if (result.success) {
				expect(result.data.itemsPerPage).toBe(20)
				expect(result.data.currentPage).toBe(2)
				expect(result.data.totalItems).toBe(100)
				expect(result.data.totalPages).toBe(5)
				expect(result.data.hasNextPage).toBe(true)
				expect(result.data.hasPreviousPage).toBe(true)
			}
		})

		it('should fail validation for invalid pagination meta', () => {
			const invalidMeta = {
				itemsPerPage: -20,
				currentPage: 0,
				totalItems: -100,
				totalPages: -5,
				hasNextPage: 'yes',
				hasPreviousPage: 'no'
			}

			const result = paginationMetaSchema.safeParse(invalidMeta)

			expect(result.success).toBe(false)

			if (!result.success) {
				expect(result.error).toBeInstanceOf(ZodError)
				expect(result.error.issues.length).toBeGreaterThan(0)

				const itemsPerPageIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'itemsPerPage'
				)
				const currentPageIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'currentPage'
				)
				const totalItemsIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'totalItems'
				)
				const totalPagesIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'totalPages'
				)
				const hasNextPageIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'hasNextPage'
				)
				const hasPreviousPageIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'hasPreviousPage'
				)

				expect(itemsPerPageIssue).toBeDefined()
				expect(currentPageIssue).toBeDefined()
				expect(totalItemsIssue).toBeDefined()
				expect(totalPagesIssue).toBeDefined()
				expect(hasNextPageIssue).toBeDefined()
				expect(hasPreviousPageIssue).toBeDefined()

				expect(itemsPerPageIssue?.code).toBe('too_small')
				expect(currentPageIssue?.code).toBe('too_small')
				expect(totalItemsIssue?.code).toBe('too_small')
				expect(totalPagesIssue?.code).toBe('too_small')
				expect(hasNextPageIssue?.code).toBe('invalid_type')
				expect(hasPreviousPageIssue?.code).toBe('invalid_type')
			}
		})

		it('should allow zero total items and pages', () => {
			const validMeta: PaginationMeta = {
				itemsPerPage: 10,
				currentPage: 1,
				totalItems: 0,
				totalPages: 0,
				hasNextPage: false,
				hasPreviousPage: false
			}

			const result = paginationMetaSchema.safeParse(validMeta)

			expect(result.success).toBe(true)

			if (result.success) {
				expect(result.data.totalItems).toBe(0)
				expect(result.data.totalPages).toBe(0)
				expect(result.data.hasNextPage).toBe(false)
				expect(result.data.hasPreviousPage).toBe(false)
			}
		})
	})
})
