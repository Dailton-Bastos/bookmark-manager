import { Test, TestingModule } from '@nestjs/testing'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { schema } from '../../database/schemas'
import { DATABASE_CONNECTION } from '../../shared/constants/database'
import { mockTag } from '../__mocks__/tag.mock'
import { TagsService } from '../tags.service'

describe('TagsService', () => {
	let service: TagsService
	let db: NodePgDatabase<typeof schema>

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TagsService,
				{
					provide: DATABASE_CONNECTION,
					useValue: {
						insert: jest.fn().mockReturnThis(),
						values: jest.fn().mockReturnThis(),
						returning: jest.fn().mockResolvedValue([mockTag]),
						onConflictDoUpdate: jest.fn().mockReturnThis()
					} as unknown as NodePgDatabase<typeof schema>
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
			set: { name: schema.tags.name }
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
