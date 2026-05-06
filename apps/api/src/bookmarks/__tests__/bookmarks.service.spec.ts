import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import type { CreateBookmark } from '@repo/schemas'
import type { SQL } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { schema } from '../../database/schemas'
import { mockMetaPagination } from '../../pagination/__mocks__/pagination.mock'
import { PaginationProvider } from '../../pagination/pagination.provider'
import { LISTBOOKMARKS_CACHE_KEY } from '../../shared/constants/cache'
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
	let cacheManager: Cache
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
				},
				{
					provide: CACHE_MANAGER,
					useValue: {
						get: jest.fn(),
						set: jest.fn(),
						del: jest.fn(),
						clear: jest.fn()
					} as unknown as Cache
				}
			]
		}).compile()

		service = module.get<BookmarksService>(BookmarksService)
		tagsService = module.get<TagsService>(TagsService)
		paginationProvider = module.get<PaginationProvider>(PaginationProvider)
		db = module.get<NodePgDatabase<typeof schema>>(DATABASE_CONNECTION)
		cacheManager = module.get<Cache>(CACHE_MANAGER)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
		expect(tagsService).toBeDefined()
		expect(paginationProvider).toBeDefined()
		expect(db).toBeDefined()
		expect(cacheManager).toBeDefined()
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

			const registryKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_keys`
			const cachedListKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_1_10_asc`

			returning.mockResolvedValueOnce([mockBookmark])
			const mockRegistry: string[] = [cachedListKey]
			jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(mockRegistry)

			const result = await service.create(
				{ ...createBookmarkInput, tags: [] },
				ownerId
			)

			expect(insert).toHaveBeenCalledWith(schema.bookmarks)
			expect(cacheManager.get).toHaveBeenCalledWith(registryKey)
			expect(cacheManager.del).toHaveBeenCalledWith(cachedListKey)
			expect(cacheManager.del).toHaveBeenCalledWith(registryKey)
			expect(result).toEqual({
				...mockBookmark,
				tags: []
			})
		})

		it('should return the created bookmark without tags if all provided tags are invalid', async () => {
			const insert = db.insert as jest.Mock
			const returning = (db as unknown as { returning: jest.Mock })
				.returning as jest.Mock

			const registryKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_keys`
			const cachedListKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_1_10_asc`

			returning.mockResolvedValueOnce([mockBookmark])
			jest.spyOn(tagsService, 'create').mockResolvedValueOnce(null)
			const mockRegistry: string[] = [cachedListKey]
			jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(mockRegistry)

			const result = await service.create(createBookmarkInput, ownerId)

			expect(insert).toHaveBeenCalledWith(schema.bookmarks)
			expect(tagsService.create).toHaveBeenCalledWith(
				{ name: 'Test Tag' },
				expect.anything()
			)
			expect(cacheManager.get).toHaveBeenCalledWith(registryKey)
			expect(cacheManager.del).toHaveBeenCalledWith(cachedListKey)
			expect(cacheManager.del).toHaveBeenCalledWith(registryKey)
			expect(result).toEqual({
				...mockBookmark,
				tags: []
			})
		})
	})

	describe('list', () => {
		it('should return empty paginated result if no bookmarks count is found', async () => {
			const select = db.select as jest.Mock

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValueOnce([])
			})

			const result = await service.list(
				{ limit: 10, page: 1, order: 'desc' },
				'user-123'
			)

			expect(select).toHaveBeenCalledWith({ bookmarksCount: expect.anything() })
			expect(result).toEqual({
				data: [],
				meta: { ...mockMetaPagination }
			})
		})

		it('should return empty paginated result if no bookmarks are found', async () => {
			const select = db.select as jest.Mock

			// Mock the total count query
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValueOnce([{ bookmarksCount: 1 }])
			})

			// Mock the bookmarks query to return no bookmarks
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockResolvedValueOnce([])
			})

			const result = await service.list(
				{ limit: 10, page: 1, order: 'desc' },
				'user-123'
			)

			expect(select).toHaveBeenCalledWith()
			expect(select).toHaveBeenCalledTimes(2)
			expect(select).toHaveBeenCalledWith({ bookmarksCount: expect.anything() })
			expect(result).toEqual({
				data: [],
				meta: { ...mockMetaPagination, totalItems: 0, totalPages: 0 }
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
				{ limit: 10, page: 1, order: 'desc' },
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
				{ limit: 10, page: 1, order: 'desc' },
				'user-123'
			)

			expect(result).toEqual({
				data: [mockBookmarkWithoutTags],
				meta: { ...mockMetaPagination, totalItems: 1, totalPages: 1 }
			})
		})

		it('should return cached result if available', async () => {
			const cachedBookmarks = {
				data: [mockBookmarkWithTags],
				meta: { ...mockMetaPagination, totalItems: 1, totalPages: 1 }
			}

			jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(cachedBookmarks)
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

			const query = { limit: 10, page: 1, order: 'desc' as const }
			const ownerId = 'user-123'
			const cacheKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_${query.page}_${query.limit}_${query.order}`

			const result = await service.list(query, ownerId)

			expect(cacheManager.get).toHaveBeenCalledWith(cacheKey)
			expect(result).toEqual(cachedBookmarks)
			expect(db.transaction).not.toHaveBeenCalled()
			expect(paginationProvider.paginateQuery).not.toHaveBeenCalled()
			expect(cacheManager.set).not.toHaveBeenCalled()
			expect(cacheManager.del).not.toHaveBeenCalled()
		})

		it('should cache the result on a cache miss and write back via cacheManager.set', async () => {
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

			const query = { limit: 10, page: 1, order: 'desc' as const }
			const ownerId = 'user-123'
			const cacheKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_${query.page}_${query.limit}_${query.order}`
			const registryKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_keys`

			// Simulate cache miss for the main key, then empty registry
			jest
				.spyOn(cacheManager, 'get')
				.mockResolvedValueOnce(undefined) // cache miss for cacheKey
				.mockResolvedValueOnce(undefined) // no existing keys in registry

			const result = await service.list(query, ownerId)

			expect(cacheManager.get).toHaveBeenCalledWith(cacheKey)
			expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, result)
			expect(cacheManager.get).toHaveBeenCalledWith(registryKey)
			expect(cacheManager.set).toHaveBeenCalledWith(registryKey, [cacheKey])
		})

		it('should sort by lastVisited DESC NULLS LAST when order is recently_visited', async () => {
			const select = db.select as jest.Mock

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValueOnce([{ bookmarksCount: 1 }])
			})

			const orderByMock = jest.fn().mockResolvedValueOnce([mockBookmark])
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				orderBy: orderByMock
			})

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				leftJoin: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValueOnce([])
			})

			await service.list(
				{ limit: 10, page: 1, order: 'recently_visited' },
				'user-123'
			)

			expect(orderByMock).toHaveBeenCalledTimes(1)
			const orderByArgs: SQL[] = orderByMock.mock.calls[0]
			expect(orderByArgs).toHaveLength(2)
			// Verify the first clause is a raw SQL template containing NULLS LAST
			const queryChunks = (
				orderByArgs[0] as unknown as {
					queryChunks: Array<{ value?: string[] }>
				}
			).queryChunks
			const hasNullsLast = queryChunks.some((chunk) =>
				chunk.value?.includes(' DESC NULLS LAST')
			)
			expect(hasNullsLast).toBe(true)
		})

		it('should sort by visitCount DESC with id tiebreaker when order is most_visited', async () => {
			const select = db.select as jest.Mock

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValueOnce([{ bookmarksCount: 1 }])
			})

			const orderByMock = jest.fn().mockResolvedValueOnce([mockBookmark])
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				orderBy: orderByMock
			})

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				leftJoin: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValueOnce([])
			})

			await service.list(
				{ limit: 10, page: 1, order: 'most_visited' },
				'user-123'
			)

			expect(orderByMock).toHaveBeenCalledTimes(1)
			const orderByArgs: SQL[] = orderByMock.mock.calls[0]
			expect(orderByArgs).toHaveLength(2)
		})
	})
})
