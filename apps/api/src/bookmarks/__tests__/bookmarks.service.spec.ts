import { Test, TestingModule } from '@nestjs/testing'
import type { CreateBookmark } from '@repo/schemas'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { schema } from '../../database/schemas'
import { mockMetaPagination } from '../../pagination/__mocks__/pagination.mock'
import { PaginationProvider } from '../../pagination/pagination.provider'
import { DATABASE_CONNECTION } from '../../shared/constants/database'
import { TagsService } from '../../tags/tags.service'
import {
	mockBookmark,
	mockBookmarkWithoutTags,
	mockBookmarkWithTags
} from '../__mocks__/bookmark.mock'
import { BookmarksService } from '../bookmarks.service'

describe('BookmarksService', () => {
	let service: BookmarksService
	let tagsService: TagsService
	let paginationProvider: PaginationProvider
	let db: NodePgDatabase<typeof schema>
	let mockDb: {
		insert: jest.Mock
		values: jest.Mock
		returning: jest.Mock
		onConflictDoUpdate: jest.Mock
		transaction: jest.Mock
		select: jest.Mock
	}

	beforeEach(async () => {
		mockDb = {
			insert: jest.fn().mockReturnThis(),
			values: jest.fn().mockReturnThis(),
			returning: jest.fn().mockResolvedValue([mockBookmark]),
			onConflictDoUpdate: jest.fn().mockReturnThis(),
			transaction: jest.fn(),
			select: jest.fn().mockReturnThis()
		}
		mockDb.transaction.mockImplementation(
			async (cb: (tx: typeof mockDb) => Promise<unknown>) => cb(mockDb)
		)

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BookmarksService,
				TagsService,
				PaginationProvider,
				{
					provide: DATABASE_CONNECTION,
					useValue: mockDb as unknown as NodePgDatabase<typeof schema>
				}
			]
		}).compile()

		service = module.get<BookmarksService>(BookmarksService)
		tagsService = module.get<TagsService>(TagsService)
		paginationProvider = module.get<PaginationProvider>(PaginationProvider)
		db = module.get<NodePgDatabase<typeof schema>>(DATABASE_CONNECTION)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
		expect(tagsService).toBeDefined()
		expect(paginationProvider).toBeDefined()
		expect(db).toBeDefined()
	})

	describe('create', () => {
		const createBookmarkInput: CreateBookmark = {
			title: 'Test Bookmark',
			description: 'This is a test bookmark.',
			url: 'https://example.com',
			tags: ['Test Tag']
		}
		const ownerId = 'user-123'

		it('should return null if bookmark creation fails', async () => {
			const insert = db.insert as jest.Mock
			const returning = (db as unknown as { returning: jest.Mock })
				.returning as jest.Mock

			returning.mockResolvedValueOnce([])

			const result = await service.create(createBookmarkInput, ownerId)

			expect(insert).toHaveBeenCalledWith(schema.bookmarks)
			expect(result).toBeNull()
		})

		it('should throw an error if tag creation fails', async () => {
			const insert = db.insert as jest.Mock
			const returning = (db as unknown as { returning: jest.Mock })
				.returning as jest.Mock

			returning.mockResolvedValueOnce([mockBookmark])
			jest
				.spyOn(tagsService, 'create')
				.mockRejectedValueOnce(new Error('Failed to create bookmark tags'))

			await expect(
				service.create(createBookmarkInput, ownerId)
			).rejects.toThrow('Failed to create bookmark tags')
			expect(mockDb.transaction).toHaveBeenCalled()
			expect(insert).toHaveBeenCalledWith(schema.bookmarks)
			expect(tagsService.create).toHaveBeenCalledWith(
				{ name: 'Test Tag' },
				expect.anything()
			)
		})

		it('should return the created bookmark with tags', async () => {
			const insert = db.insert as jest.Mock
			const returning = (db as unknown as { returning: jest.Mock })
				.returning as jest.Mock

			returning.mockResolvedValueOnce([mockBookmark])
			jest.spyOn(tagsService, 'create').mockResolvedValueOnce({
				id: 1,
				name: 'Test Tag'
			})

			const result = await service.create(createBookmarkInput, ownerId)

			expect(insert).toHaveBeenCalledWith(schema.bookmarks)
			expect(tagsService.create).toHaveBeenCalledTimes(1)
			expect(insert).toHaveBeenCalledWith(schema.bookmarkTags)
			expect(tagsService.create).toHaveBeenCalledWith(
				{ name: 'Test Tag' },
				expect.anything()
			)
			expect(result).toEqual({
				...mockBookmark,
				tags: [
					{
						id: 1,
						name: 'Test Tag'
					}
				]
			})
		})

		it('should return the created bookmark without tags if no tags are provided', async () => {
			const insert = db.insert as jest.Mock
			const returning = (db as unknown as { returning: jest.Mock })
				.returning as jest.Mock

			returning.mockResolvedValueOnce([mockBookmark])

			const result = await service.create(
				{ ...createBookmarkInput, tags: [] },
				ownerId
			)

			expect(insert).toHaveBeenCalledWith(schema.bookmarks)
			expect(result).toEqual({
				...mockBookmark,
				tags: []
			})
		})
	})

	describe('list', () => {
		it('should return empty paginated result if no bookmarks are found', async () => {
			const select = db.select as jest.Mock

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValueOnce([])
			})

			const result = await service.list(
				{ limit: 10, page: 1, order: 'asc' },
				'user-123'
			)

			expect(select).toHaveBeenCalledWith({ bookmarksCount: expect.anything() })
			expect(result).toEqual({
				data: [],
				meta: { ...mockMetaPagination }
			})
		})

		it('should return paginated bookmarks with tags', async () => {
			const select = db.select as jest.Mock

			// Mock the total count query
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValueOnce([{ bookmarksCount: 1 }])
			})

			// Mock the bookmarks query
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockResolvedValueOnce([mockBookmark])
			})

			// Mock the bookmark tags query
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				leftJoin: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValueOnce([
					{
						bookmarkId: 1,
						tag: { id: 1, name: 'Test Tag' }
					}
				])
			})

			jest
				.spyOn(paginationProvider, 'paginateQuery')
				.mockImplementationOnce(({ paginationQuery, data, totalCount }) => ({
					data,
					meta: {
						itemsPerPage: paginationQuery.limit,
						currentPage: paginationQuery.page,
						totalItems: totalCount,
						totalPages: Math.ceil(totalCount / paginationQuery.limit),
						hasNextPage:
							paginationQuery.page * paginationQuery.limit < totalCount,
						hasPreviousPage: paginationQuery.page > 1
					}
				}))

			const result = await service.list(
				{ limit: 10, page: 1, order: 'asc' },
				'user-123'
			)

			expect(select).toHaveBeenCalledWith()
			expect(select).toHaveBeenCalledTimes(3)
			expect(select).toHaveBeenCalledWith({ bookmarksCount: expect.anything() })
			expect(select).toHaveBeenCalledWith({
				bookmarkId: expect.anything(),
				tag: expect.anything()
			})
			expect(paginationProvider.paginateQuery).toHaveBeenCalledWith({
				paginationQuery: { page: 1, limit: 10 },
				data: expect.any(Array),
				totalCount: expect.any(Number)
			})

			expect(result).toEqual({
				data: [mockBookmarkWithTags],
				meta: { ...mockMetaPagination, totalItems: 1, totalPages: 1 }
			})
		})

		it('should return paginated bookmarks without tags if no tags are found', async () => {
			const select = db.select as jest.Mock

			// Mock the total count query
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValueOnce([{ bookmarksCount: 1 }])
			})

			// Mock the bookmarks query
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockResolvedValueOnce([mockBookmark])
			})

			// Mock the bookmark tags query to return no tags
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				leftJoin: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValueOnce([])
			})

			jest
				.spyOn(paginationProvider, 'paginateQuery')
				.mockImplementationOnce(({ paginationQuery, data, totalCount }) => ({
					data,
					meta: {
						itemsPerPage: paginationQuery.limit,
						currentPage: paginationQuery.page,
						totalItems: totalCount,
						totalPages: Math.ceil(totalCount / paginationQuery.limit),
						hasNextPage:
							paginationQuery.page * paginationQuery.limit < totalCount,
						hasPreviousPage: paginationQuery.page > 1
					}
				}))

			const result = await service.list(
				{ limit: 10, page: 1, order: 'asc' },
				'user-123'
			)

			expect(result).toEqual({
				data: [mockBookmarkWithoutTags],
				meta: { ...mockMetaPagination, totalItems: 1, totalPages: 1 }
			})
		})
	})
})
