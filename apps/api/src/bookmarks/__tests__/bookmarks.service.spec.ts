import { Test, TestingModule } from '@nestjs/testing'
import type { CreateBookmark } from '@repo/schemas'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { schema } from '../../database/schemas'
import { DATABASE_CONNECTION } from '../../shared/constants/database'
import { mockBookmark } from '../__mocks__/bookmark.mock'
import { BookmarksService } from '../bookmarks.service'

describe('BookmarksService', () => {
	let service: BookmarksService
	let db: NodePgDatabase<typeof schema>

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BookmarksService,
				{
					provide: DATABASE_CONNECTION,
					useValue: {
						insert: jest.fn().mockReturnThis(),
						values: jest.fn().mockReturnThis(),
						returning: jest.fn().mockResolvedValue([mockBookmark])
					} as unknown as NodePgDatabase<typeof schema>
				}
			]
		}).compile()

		service = module.get<BookmarksService>(BookmarksService)
		db = module.get<NodePgDatabase<typeof schema>>(DATABASE_CONNECTION)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
		expect(db).toBeDefined()
	})

	it('should create a bookmark', async () => {
		const createBookmarkInput: CreateBookmark = {
			title: 'Test Bookmark',
			description: 'This is a test bookmark.',
			url: 'https://example.com'
		}
		const ownerId = 'user-123'

		const insert = db.insert as jest.Mock
		const values = (db as unknown as { values: jest.Mock }).values as jest.Mock
		const returning = (db as unknown as { returning: jest.Mock })
			.returning as jest.Mock

		const result = await service.create(createBookmarkInput, ownerId)

		expect(insert).toHaveBeenCalledWith(schema.bookmarks)
		expect(values).toHaveBeenCalledWith({
			title: createBookmarkInput.title,
			description: createBookmarkInput.description,
			url: createBookmarkInput.url,
			ownerId
		})
		expect(returning).toHaveBeenCalled()
		expect(result).toEqual(mockBookmark)
	})
})
