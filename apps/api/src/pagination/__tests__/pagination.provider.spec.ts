import { Test, TestingModule } from '@nestjs/testing'
import { PaginationProvider } from '../pagination.provider'

describe('Pagination', () => {
	let provider: PaginationProvider

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PaginationProvider]
		}).compile()

		provider = module.get<PaginationProvider>(PaginationProvider)
	})

	it('should be defined', () => {
		expect(provider).toBeDefined()
	})

	it('should return default pagination options', () => {
		const defaultOptions = provider.paginateQuery({
			paginationQuery: {
				page: 1,
				limit: 10
			},
			totalCount: 0,
			data: []
		}).meta

		expect(defaultOptions).toEqual({
			itemsPerPage: 10,
			currentPage: 1,
			totalItems: 0,
			totalPages: 0,
			hasNextPage: false,
			hasPreviousPage: false
		})
	})

	it('should return correct pagination meta', () => {
		const totalCount = 25
		const page = 2
		const limit = 10

		const response = provider.paginateQuery({
			paginationQuery: {
				page,
				limit
			},
			totalCount,
			data: []
		})

		expect(response.meta).toEqual({
			itemsPerPage: limit,
			currentPage: page,
			totalItems: totalCount,
			totalPages: Math.ceil(totalCount / limit),
			hasNextPage: page * limit < totalCount,
			hasPreviousPage: page > 1
		})
	})

	it('should return correct pagination data', () => {
		const data = [{ id: 1 }, { id: 2 }, { id: 3 }]
		const response = provider.paginateQuery({
			paginationQuery: {
				page: 1,
				limit: 10
			},
			totalCount: data.length,
			data
		})

		expect(response.data).toEqual(data)
	})
})
