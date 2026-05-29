import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import type { CreateBookmark } from '@repo/schemas'
import type { SQL } from 'drizzle-orm'
import { and, eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { PgDialect } from 'drizzle-orm/pg-core'
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
	const pgDialect = new PgDialect()
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
		update: jest.Mock
		delete: jest.Mock
		query: {
			bookmarks: {
				findFirst: jest.Mock
			}
		}
	}

	beforeEach(async () => {
		mockDb = {
			insert: jest.fn().mockReturnThis(),
			values: jest.fn().mockReturnThis(),
			returning: jest.fn().mockResolvedValue([mockBookmark]),
			onConflictDoUpdate: jest.fn().mockReturnThis(),
			transaction: jest.fn(),
			select: jest.fn().mockReturnThis(),
			update: jest.fn().mockReturnThis(),
			delete: jest.fn().mockReturnThis(),
			query: {
				bookmarks: {
					findFirst: jest.fn()
				}
			}
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
		it.each([
			{
				name: 'include',
				query: {
					limit: 10,
					page: 1,
					order: 'desc' as const,
					archived: 'include' as const
				},
				expectedSql: '"bookmarks"."owner_id" = $1',
				expectedParams: ['user-123']
			},
			{
				name: 'exclude',
				query: {
					limit: 10,
					page: 1,
					order: 'desc' as const,
					archived: 'exclude' as const
				},
				expectedSql:
					'("bookmarks"."owner_id" = $1 and "bookmarks"."is_archived" = $2)',
				expectedParams: ['user-123', false]
			},
			{
				name: 'only',
				query: {
					limit: 10,
					page: 1,
					order: 'desc' as const,
					archived: 'only' as const
				},
				expectedSql:
					'("bookmarks"."owner_id" = $1 and "bookmarks"."is_archived" = $2)',
				expectedParams: ['user-123', true]
			},
			{
				name: 'default include',
				query: { limit: 10, page: 1, order: 'desc' as const },
				expectedSql: '"bookmarks"."owner_id" = $1',
				expectedParams: ['user-123']
			}
		])('should apply the correct archived filter for $name', async ({
			query,
			expectedSql,
			expectedParams
		}) => {
			const select = db.select as jest.Mock
			const whereCountMock = jest.fn().mockReturnThis()
			const whereBookmarksMock = jest.fn().mockReturnThis()
			const whereTagsMock = jest.fn().mockResolvedValueOnce([])

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: whereCountMock,
				groupBy: jest.fn().mockResolvedValueOnce([{ bookmarksCount: 1 }])
			})

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: whereBookmarksMock,
				limit: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockResolvedValueOnce([mockBookmark])
			})

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				leftJoin: jest.fn().mockReturnThis(),
				where: whereTagsMock
			})

			await service.list(query, 'user-123')

			const countWhereQuery = pgDialect.sqlToQuery(
				whereCountMock.mock.calls[0][0] as SQL
			)
			const bookmarksWhereQuery = pgDialect.sqlToQuery(
				whereBookmarksMock.mock.calls[0][0] as SQL
			)

			expect(countWhereQuery.sql).toBe(expectedSql)
			expect(countWhereQuery.params).toEqual(expectedParams)
			expect(bookmarksWhereQuery.sql).toBe(expectedSql)
			expect(bookmarksWhereQuery.params).toEqual(expectedParams)
			expect(whereTagsMock).toHaveBeenCalledTimes(1)
		})

		it('should return empty paginated result if no bookmarks count is found', async () => {
			const select = db.select as jest.Mock

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				groupBy: jest.fn().mockResolvedValueOnce([])
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
				where: jest.fn().mockReturnThis(),
				groupBy: jest.fn().mockResolvedValueOnce([{ bookmarksCount: 1 }])
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
				where: jest.fn().mockReturnThis(),
				groupBy: jest.fn().mockResolvedValueOnce([{ bookmarksCount: 1 }])
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
				{ limit: 10, page: 1, order: 'desc', archived: 'exclude' },
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
				where: jest.fn().mockReturnThis(),
				groupBy: jest.fn().mockResolvedValueOnce([{ bookmarksCount: 1 }])
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
				{ limit: 10, page: 1, order: 'desc', archived: 'only' },
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

			const query = {
				limit: 10,
				page: 1,
				order: 'desc' as const,
				archived: 'include' as const
			}
			const ownerId = 'user-123'
			const cacheKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_${query.page}_${query.limit}_${query.order}_${query.archived}`

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
				where: jest.fn().mockReturnThis(),
				groupBy: jest.fn().mockResolvedValueOnce([{ bookmarksCount: 1 }])
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

			const query = {
				limit: 10,
				page: 1,
				order: 'desc' as const,
				archived: 'exclude' as const
			}
			const ownerId = 'user-123'
			const cacheKey = `${LISTBOOKMARKS_CACHE_KEY}_${ownerId}_${query.page}_${query.limit}_${query.order}_${query.archived}`
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

		it.each([
			{
				name: 'include',
				query: {
					limit: 10,
					page: 1,
					order: 'desc' as const,
					archived: 'include' as const
				},
				expectedSql: '"bookmarks"."pinned" DESC'
			},
			{
				name: 'exclude',
				query: {
					limit: 10,
					page: 1,
					order: 'desc' as const,
					archived: 'exclude' as const
				},
				expectedSql: '"bookmarks"."pinned" DESC'
			},
			{
				name: 'only',
				query: {
					limit: 10,
					page: 1,
					order: 'desc' as const,
					archived: 'only' as const
				},
				expectedSql: '"bookmarks"."archived_at" DESC NULLS LAST'
			}
		])('should use the correct leading order clause for archived $name', async ({
			query,
			expectedSql
		}) => {
			const select = db.select as jest.Mock

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				groupBy: jest.fn().mockResolvedValueOnce([{ bookmarksCount: 1 }])
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

			await service.list(query, 'user-123')

			expect(orderByMock).toHaveBeenCalledTimes(1)
			const orderByArgs: SQL[] = orderByMock.mock.calls[0]
			// biome-ignore lint/style/noNonNullAssertion: <Only for test readability>
			expect(pgDialect.sqlToQuery(orderByArgs[0]!).sql).toBe(expectedSql)
		})

		it('should sort by lastVisited DESC NULLS LAST when order is recently_visited', async () => {
			const select = db.select as jest.Mock

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				groupBy: jest.fn().mockResolvedValueOnce([{ bookmarksCount: 1 }])
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
				{ limit: 10, page: 1, order: 'recently_visited', archived: 'include' },
				'user-123'
			)

			expect(orderByMock).toHaveBeenCalledTimes(1)
			const orderByArgs: SQL[] = orderByMock.mock.calls[0]
			expect(orderByArgs).toHaveLength(3)
			// Verify the second clause is a raw SQL template containing NULLS LAST
			const queryChunks = (
				orderByArgs[1] as unknown as {
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
				where: jest.fn().mockReturnThis(),
				groupBy: jest.fn().mockResolvedValueOnce([{ bookmarksCount: 1 }])
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
			expect(orderByArgs).toHaveLength(3)
		})
	})

	describe('findById', () => {
		it('should return null if the bookmark is not found', async () => {
			const query = db.query.bookmarks.findFirst as jest.Mock
			query.mockResolvedValueOnce(undefined)

			const result = await service.findById(1, 'user-123')

			expect(query).toHaveBeenCalledWith({
				where: and(
					eq(schema.bookmarks.id, expect.any(Number)),
					eq(schema.bookmarks.ownerId, expect.any(String))
				)
			})

			expect(result).toBeNull()
		})

		it('should return the bookmark with tags if found', async () => {
			const query = db.query.bookmarks.findFirst as jest.Mock
			query.mockResolvedValueOnce(mockBookmark)

			jest.spyOn(tagsService, 'findByBookmarkIds').mockResolvedValueOnce({
				1: [{ id: 1, name: 'Test Tag' }]
			})

			const result = await service.findById(1, 'user-123')

			expect(query).toHaveBeenCalledWith({
				where: and(
					eq(schema.bookmarks.id, expect.any(Number)),
					eq(schema.bookmarks.ownerId, expect.any(String))
				)
			})

			expect(result).toEqual({
				...mockBookmark,
				tags: [{ id: 1, name: 'Test Tag' }]
			})
		})
	})

	describe('archiveOrUnarchive', () => {
		it('should return null if the bookmark to archive/unarchive is not found', async () => {
			jest.spyOn(service, 'findById').mockResolvedValueOnce(null)

			const result = await service.archiveOrUnarchive(
				{ id: 1, isArchived: true },
				'user-123'
			)

			expect(service.findById).toHaveBeenCalledWith(1, 'user-123')
			expect(result).toBeNull()
		})

		it('should return null if the bookmark to archive/unarchive does not belong to the owner', async () => {
			const existingBookmark = { ...mockBookmark, ownerId: 'other-user' }

			const update = db.update as jest.Mock
			update.mockReturnValueOnce({
				where: jest.fn().mockReturnThis(),
				set: jest.fn().mockReturnThis(),
				returning: jest.fn().mockResolvedValueOnce([])
			})

			jest.spyOn(service, 'findById').mockResolvedValueOnce(existingBookmark)

			const result = await service.archiveOrUnarchive(
				{ id: 1, isArchived: true },
				'user-123'
			)

			expect(service.findById).toHaveBeenCalledWith(1, 'user-123')
			expect(result).toBeNull()
		})

		it('should archive/unarchive a bookmark and invalidate cache', async () => {
			const update = db.update as jest.Mock

			const existingBookmark = { ...mockBookmark, isArchived: false }

			update.mockReturnValueOnce({
				where: jest.fn().mockReturnThis(),
				set: jest.fn().mockReturnThis(),
				returning: jest
					.fn()
					.mockResolvedValueOnce([
						{ ...existingBookmark, isArchived: true, updatedAt: new Date() }
					])
			})

			jest.spyOn(service, 'findById').mockResolvedValueOnce(existingBookmark)

			jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(['cache-key']) // Simulate empty cache registry for the owner

			const result = await service.archiveOrUnarchive(
				{ id: 1, isArchived: true },
				'user-123'
			)

			expect(service.findById).toHaveBeenCalledWith(1, 'user-123')
			expect(db.update).toHaveBeenCalledWith(schema.bookmarks)
			expect(cacheManager.del).toHaveBeenCalledWith(
				expect.stringContaining('user-123')
			)
			expect(result).toEqual({
				...existingBookmark,
				isArchived: true,
				updatedAt: expect.any(Date)
			})
		})
	})

	describe('pinOrUnpin', () => {
		it('should return null if the bookmark to pin/unpin is not found', async () => {
			jest.spyOn(service, 'findById').mockResolvedValueOnce(null)

			const result = await service.pinOrUnpin(
				{ id: 1, pinned: true },
				'user-123'
			)

			expect(service.findById).toHaveBeenCalledWith(1, 'user-123')
			expect(result).toBeNull()
		})

		it('should return null if the bookmark to pin/unpin does not belong to the owner', async () => {
			const existingBookmark = { ...mockBookmark, ownerId: 'other-user' }

			const update = db.update as jest.Mock
			update.mockReturnValueOnce({
				where: jest.fn().mockReturnThis(),
				set: jest.fn().mockReturnThis(),
				returning: jest.fn().mockResolvedValueOnce([])
			})

			jest.spyOn(service, 'findById').mockResolvedValueOnce(existingBookmark)

			const result = await service.pinOrUnpin(
				{ id: 1, pinned: true },
				'user-123'
			)

			expect(service.findById).toHaveBeenCalledWith(1, 'user-123')
			expect(result).toBeNull()
		})

		it('should pin/unpin a bookmark', async () => {
			const update = db.update as jest.Mock

			const existingBookmark = { ...mockBookmark, pinned: false }

			update.mockReturnValueOnce({
				where: jest.fn().mockReturnThis(),
				set: jest.fn().mockReturnThis(),
				returning: jest
					.fn()
					.mockResolvedValueOnce([
						{ ...existingBookmark, pinned: true, updatedAt: new Date() }
					])
			})

			jest.spyOn(service, 'findById').mockResolvedValueOnce(existingBookmark)

			const result = await service.pinOrUnpin(
				{ id: 1, pinned: true },
				'user-123'
			)

			expect(service.findById).toHaveBeenCalledWith(1, 'user-123')
			expect(db.update).toHaveBeenCalledWith(schema.bookmarks)
			expect(result).toEqual({
				...existingBookmark,
				pinned: true,
				updatedAt: expect.any(Date)
			})
		})
	})

	describe('visited', () => {
		it('should return null if the bookmark to update visit is not found', async () => {
			jest.spyOn(service, 'findById').mockResolvedValueOnce(null)

			const result = await service.visited({ id: 1 }, 'user-123')

			expect(service.findById).toHaveBeenCalledWith(1, 'user-123')
			expect(result).toBeNull()
		})

		it('should update lastVisited, increment visitCount and invalidate cache', async () => {
			const update = db.update as jest.Mock
			const existingBookmark = {
				...mockBookmark,
				visitCount: 5,
				lastVisited: new Date('2026-01-01T10:00:00.000Z')
			}
			const newVisitDate = new Date('2026-01-02T12:00:00.000Z')

			update.mockReturnValueOnce({
				set: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				returning: jest.fn().mockResolvedValueOnce([
					{
						...existingBookmark,
						visitCount: existingBookmark.visitCount + 1,
						lastVisited: newVisitDate,
						updatedAt: new Date()
					}
				])
			})

			jest.spyOn(service, 'findById').mockResolvedValueOnce(existingBookmark)
			jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(['cache-key'])

			const result = await service.visited({ id: 1 }, 'user-123')

			expect(service.findById).toHaveBeenCalledWith(1, 'user-123')
			expect(db.update).toHaveBeenCalledWith(schema.bookmarks)
			expect(cacheManager.del).toHaveBeenCalledWith('cache-key')
			expect(result).toEqual({
				...existingBookmark,
				visitCount: 6,
				lastVisited: newVisitDate,
				updatedAt: expect.any(Date)
			})
		})
	})

	describe('delete', () => {
		it('should return null if the bookmark to delete is not found', async () => {
			jest.spyOn(service, 'findById').mockResolvedValueOnce(null)

			const result = await service.delete(1, 'user-123')

			expect(service.findById).toHaveBeenCalledWith(1, 'user-123')
			expect(result).toBeNull()
			expect(db.delete).not.toHaveBeenCalled()
		})

		it('should delete a bookmark and invalidate cache', async () => {
			const deleteMock = db.delete as jest.Mock
			const whereMock = jest.fn().mockResolvedValueOnce(undefined)

			deleteMock.mockReturnValueOnce({
				where: whereMock
			})

			jest.spyOn(service, 'findById').mockResolvedValueOnce(mockBookmark)
			jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(['cache-key'])

			const result = await service.delete(1, 'user-123')

			expect(service.findById).toHaveBeenCalledWith(1, 'user-123')
			expect(db.delete).toHaveBeenCalledWith(schema.bookmarks)
			expect(whereMock).toHaveBeenCalledWith(
				and(
					eq(schema.bookmarks.id, expect.any(Number)),
					eq(schema.bookmarks.ownerId, expect.any(String))
				)
			)
			expect(cacheManager.del).toHaveBeenCalledWith('cache-key')
			expect(cacheManager.del).toHaveBeenCalledWith(
				expect.stringContaining('user-123')
			)
			expect(result).toBeUndefined()
		})
	})
})
