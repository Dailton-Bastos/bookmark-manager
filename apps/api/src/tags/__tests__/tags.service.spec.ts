import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import { eq, inArray } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { mockBookmarkTags } from '../../bookmarks/__mocks__/bookmark-tags.mock'
import { CacheProvider } from '../../cache/cache.provider'
import { schema } from '../../database/schemas'
import { mockMetaPagination } from '../../pagination/__mocks__/pagination.mock'
import { PaginationProvider } from '../../pagination/pagination.provider'
import { LISTTAGS_CACHE_KEY } from '../../shared/constants/cache'
import { DATABASE_CONNECTION } from '../../shared/constants/database'
import { mockTag, tagWithBookmarkCount } from '../__mocks__/tag.mock'
import { TagsService } from '../tags.service'

describe('TagsService', () => {
	let service: TagsService
	let paginationProvider: PaginationProvider
	let cacheManager: Cache
	let cacheProvider: CacheProvider
	let db: NodePgDatabase<typeof schema>
	let mockDb: {
		insert: jest.Mock
		values: jest.Mock
		returning: jest.Mock
		onConflictDoUpdate: jest.Mock
		select: jest.Mock
	}

	beforeEach(async () => {
		mockDb = {
			insert: jest.fn().mockReturnThis(),
			values: jest.fn().mockReturnThis(),
			returning: jest.fn().mockResolvedValue([mockTag]),
			onConflictDoUpdate: jest.fn().mockReturnThis(),
			select: jest.fn().mockReturnThis()
		}

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TagsService,
				PaginationProvider,
				CacheProvider,
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

		service = module.get<TagsService>(TagsService)
		db = module.get<NodePgDatabase<typeof schema>>(DATABASE_CONNECTION)
		paginationProvider = module.get<PaginationProvider>(PaginationProvider)
		cacheManager = module.get<Cache>(CACHE_MANAGER)
		cacheProvider = module.get<CacheProvider>(CacheProvider)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
		expect(db).toBeDefined()
		expect(paginationProvider).toBeDefined()
		expect(cacheManager).toBeDefined()
		expect(cacheProvider).toBeDefined()
	})

	describe('create', () => {
		it('should create a tag', async () => {
			const createTagInput = { name: 'Test Tag' }

			const insert = db.insert as jest.Mock
			const values = (db as unknown as { values: jest.Mock })
				.values as jest.Mock
			const onConflictDoUpdate = (
				db as unknown as {
					onConflictDoUpdate: jest.Mock
				}
			).onConflictDoUpdate as jest.Mock
			const returning = (db as unknown as { returning: jest.Mock })
				.returning as jest.Mock

			const result = await service.create(createTagInput)

			expect(insert).toHaveBeenCalledWith(schema.tags)
			expect(values).toHaveBeenCalledWith({ name: createTagInput.name })
			expect(onConflictDoUpdate).toHaveBeenCalledWith({
				target: schema.tags.name,
				set: { name: createTagInput.name }
			})
			expect(returning).toHaveBeenCalled()
			expect(result).toEqual(mockTag)
		})

		it('should return null if tag creation fails', async () => {
			const createTagInput = { name: 'Test Tag' }

			const returning = (db as unknown as { returning: jest.Mock })
				.returning as jest.Mock
			returning.mockResolvedValueOnce([null])

			const result = await service.create(createTagInput)

			expect(result).toBeNull()
		})
	})

	describe('findByBookmarkIds', () => {
		it('should find tags by bookmark IDs', async () => {
			const bookmarkIds = [1, 2]

			const select = db.select as jest.Mock

			const from = jest.fn().mockReturnThis()
			const leftJoin = jest.fn().mockReturnThis()
			const where = jest.fn().mockResolvedValueOnce(mockBookmarkTags)

			select.mockReturnValueOnce({
				from,
				leftJoin,
				where
			})

			const result = await service.findByBookmarkIds(bookmarkIds)

			expect(select).toHaveBeenCalledWith({
				bookmarkId: schema.bookmarkTags.bookmarkId,
				tag: schema.tags
			})
			expect(from).toHaveBeenCalledWith(schema.bookmarkTags)
			expect(leftJoin).toHaveBeenCalledWith(
				schema.tags,
				eq(schema.tags.id, schema.bookmarkTags.tagId)
			)
			expect(where).toHaveBeenCalledWith(
				inArray(schema.bookmarkTags.bookmarkId, bookmarkIds)
			)

			expect(result).toEqual({
				1: [mockTag],
				2: [mockTag]
			})
		})
	})

	describe('list', () => {
		it('should list tags with pagination', async () => {
			const paginationQuery = { limit: 10, page: 1 }
			const ownerId = 'user-123'

			const cacheKey = `${LISTTAGS_CACHE_KEY}_${ownerId}_${paginationQuery.page}_${paginationQuery.limit}`

			const cachedResult = {
				tags: [mockTag],
				totalCount: 1,
				totalPages: 1,
				currentPage: paginationQuery.page,
				limit: paginationQuery.limit
			}

			const getCache = jest.spyOn(cacheProvider, 'get')
			getCache.mockResolvedValueOnce(cachedResult)

			const result = await service.list(paginationQuery, ownerId)

			expect(getCache).toHaveBeenCalledWith(cacheKey)
			expect(result).toEqual(cachedResult)
		})

		it('should list tags with pagination when cache is empty', async () => {
			const paginationQuery = { limit: 10, page: 1 }
			const ownerId = 'user-123'

			const getCache = jest.spyOn(cacheProvider, 'get')
			getCache.mockResolvedValueOnce(null)

			const transaction = jest.fn().mockImplementation(async (callback) => {
				return callback(db)
			})
			db.transaction = transaction as unknown as typeof db.transaction

			const select = db.select as jest.Mock
			const from = jest.fn().mockReturnThis()
			const tagsLeftJoin = jest.fn().mockReturnThis()
			const where = jest.fn().mockResolvedValueOnce([{ uniqueTagsCount: 1 }])

			// Mock the total count query
			select.mockReturnValueOnce({
				from,
				leftJoin: tagsLeftJoin,
				where
			})

			// Mock the tags query
			const selectTags = db.select as jest.Mock
			const fromTags = jest.fn().mockReturnThis()
			const leftJoinTags = jest.fn().mockReturnThis()
			const whereTags = jest.fn().mockReturnThis()
			const groupByTags = jest.fn().mockReturnThis()
			const orderByTags = jest
				.fn()
				.mockResolvedValueOnce([tagWithBookmarkCount])

			selectTags.mockReturnValueOnce({
				from: fromTags,
				leftJoin: leftJoinTags,
				where: whereTags,
				limit: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				groupBy: groupByTags,
				orderBy: orderByTags
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

			const result = await service.list(paginationQuery, ownerId)

			expect(select).toHaveBeenCalledTimes(2)

			expect(select).toHaveBeenCalledWith({
				uniqueTagsCount: expect.anything()
			})

			expect(paginationProvider.paginateQuery).toHaveBeenCalledWith({
				paginationQuery: { page: 1, limit: 10 },
				data: expect.any(Array),
				totalCount: expect.any(Number)
			})

			expect(result).toEqual({
				data: [tagWithBookmarkCount],
				meta: { ...mockMetaPagination, totalItems: 1, totalPages: 1 }
			})
		})

		it('should return empty paginated result if no tags are found', async () => {
			const paginationQuery = { limit: 10, page: 1 }
			const ownerId = 'user-123'

			const getCache = jest.spyOn(cacheProvider, 'get')
			getCache.mockResolvedValueOnce(null)

			const transaction = jest.fn().mockImplementation(async (callback) => {
				return callback(db)
			})
			db.transaction = transaction as unknown as typeof db.transaction

			const select = db.select as jest.Mock
			const from = jest.fn().mockReturnThis()
			const tagsLeftJoin = jest.fn().mockReturnThis()
			const where = jest.fn().mockResolvedValueOnce([])

			// Mock the total count query
			select.mockReturnValueOnce({
				from,
				leftJoin: tagsLeftJoin,
				where
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

			const result = await service.list(paginationQuery, ownerId)

			expect(select).toHaveBeenCalledTimes(1)

			expect(select).toHaveBeenCalledWith({
				uniqueTagsCount: expect.anything()
			})

			expect(paginationProvider.paginateQuery).toHaveBeenCalledWith({
				paginationQuery: { page: 1, limit: 10 },
				data: [],
				totalCount: 0
			})

			expect(result).toEqual({
				data: [],
				meta: { ...mockMetaPagination, totalItems: 0, totalPages: 0 }
			})
		})
	})
})
