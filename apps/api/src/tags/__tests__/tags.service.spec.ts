import { Test, TestingModule } from '@nestjs/testing'
import { eq, inArray } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { mockBookmarkTags } from '../../bookmarks/__mocks__/bookmark-tags.mock'
import { schema } from '../../database/schemas'
import { DATABASE_CONNECTION } from '../../shared/constants/database'
import { mockTag } from '../__mocks__/tag.mock'
import { TagsService } from '../tags.service'

describe('TagsService', () => {
	let service: TagsService
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
				{
					provide: DATABASE_CONNECTION,
					useValue: mockDb as unknown as NodePgDatabase<typeof schema>
				}
			]
		}).compile()

		service = module.get<TagsService>(TagsService)
		db = module.get<NodePgDatabase<typeof schema>>(DATABASE_CONNECTION)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
		expect(db).toBeDefined()
	})

	it('should create a tag', async () => {
		const createTagInput = { name: 'Test Tag' }

		const insert = db.insert as jest.Mock
		const values = (db as unknown as { values: jest.Mock }).values as jest.Mock
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
