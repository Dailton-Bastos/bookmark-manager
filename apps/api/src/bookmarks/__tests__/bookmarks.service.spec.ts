import { Test, TestingModule } from '@nestjs/testing'
import type { CreateBookmark } from '@repo/schemas'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { schema } from '../../database/schemas'
import { DATABASE_CONNECTION } from '../../shared/constants/database'
import { TagsService } from '../../tags/tags.service'
import { mockBookmark } from '../__mocks__/bookmark.mock'
import { BookmarksService } from '../bookmarks.service'

describe('BookmarksService', () => {
	let service: BookmarksService
	let tagsService: TagsService
	let db: NodePgDatabase<typeof schema>

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BookmarksService,
				TagsService,
				{
					provide: DATABASE_CONNECTION,
					useValue: {
						insert: jest.fn().mockReturnThis(),
						values: jest.fn().mockReturnThis(),
						returning: jest.fn().mockResolvedValue([mockBookmark]),
						delete: jest.fn().mockReturnThis(),
						where: jest.fn().mockReturnThis(),
						onConflictDoUpdate: jest.fn().mockReturnThis()
					} as unknown as NodePgDatabase<typeof schema>
				}
			]
		}).compile()

		service = module.get<BookmarksService>(BookmarksService)
		tagsService = module.get<TagsService>(TagsService)
		db = module.get<NodePgDatabase<typeof schema>>(DATABASE_CONNECTION)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
		expect(tagsService).toBeDefined()
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
			expect(insert).toHaveBeenCalledWith(schema.bookmarks)
			expect(tagsService.create).toHaveBeenCalledWith({ name: 'Test Tag' })
			expect(db.delete).toHaveBeenCalledWith(schema.bookmarks)
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
			expect(tagsService.create).toHaveBeenCalledWith({ name: 'Test Tag' })
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
})
