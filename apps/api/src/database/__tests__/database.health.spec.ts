import { HealthIndicatorService } from '@nestjs/terminus'
import { Test, TestingModule } from '@nestjs/testing'
import { DATABASE_CONNECTION } from '../../shared/constants/database'
import { DatabaseHealthIndicator } from '../database.health'

describe('DatabaseHealthIndicator', () => {
	let databaseHealthIndicator: DatabaseHealthIndicator

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DatabaseHealthIndicator,
				{
					provide: DATABASE_CONNECTION,
					useValue: {
						execute: jest.fn()
					}
				},
				{
					provide: HealthIndicatorService,
					useValue: {
						check: jest.fn().mockReturnThis(),
						up: jest.fn().mockReturnValue({ status: 'up' }),
						down: jest.fn().mockReturnValue({ status: 'down' })
					}
				}
			]
		}).compile()

		databaseHealthIndicator = module.get<DatabaseHealthIndicator>(
			DatabaseHealthIndicator
		)
	})

	it('should be defined', () => {
		expect(databaseHealthIndicator).toBeDefined()
	})

	it('should return up when database is healthy', async () => {
		const result = await databaseHealthIndicator.isHealthy('database')

		expect(result).toEqual({ status: 'up' })
	})

	it('should return down when database connection fails', async () => {
		const error = new Error('Connection failed')

		jest
			// biome-ignore lint/complexity/useLiteralKeys: <NOTE> This is a test, and using literal keys improves readability in this context.
			.spyOn(databaseHealthIndicator['database'], 'execute')
			.mockRejectedValue(error)

		const result = await databaseHealthIndicator.isHealthy('database')

		expect(result).toEqual({ status: 'down' })
	})
})
