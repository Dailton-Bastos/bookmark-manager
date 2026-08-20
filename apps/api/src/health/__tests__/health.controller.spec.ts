import {
	DiskHealthIndicator,
	HealthCheckService,
	HealthIndicatorResult,
	MemoryHealthIndicator
} from '@nestjs/terminus'
import { Test, TestingModule } from '@nestjs/testing'
import { MailerHealthIndicator } from '@nestjs-modules/mailer'
import { DatabaseHealthIndicator } from '../../database/database.health'
import { DATABASE_HEALTH_INDICATOR } from '../../shared/constants/database'
import { downMock } from '../__mock__/down.mock'
import { upMock } from '../__mock__/up.mock'
import { HealthController } from '../health.controller'

jest.mock('@thallesp/nestjs-better-auth', () => ({
	// biome-ignore lint/suspicious/noEmptyBlockStatements: <NOTE> This is a mock, so it's fine to have empty implementations
	AllowAnonymous: jest.fn(() => () => {})
}))

describe('HealthController', () => {
	let healthController: HealthController
	let health: HealthCheckService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [HealthController],
			providers: [
				{
					provide: HealthCheckService,
					useValue: {
						check: jest.fn()
					}
				},
				{
					provide: DiskHealthIndicator,
					useValue: {
						checkStorage: jest
							.fn()
							.mockResolvedValue({} as HealthIndicatorResult<'storage'>)
					}
				},
				{
					provide: MemoryHealthIndicator,
					useValue: {
						checkHeap: jest
							.fn()
							.mockResolvedValue({} as HealthIndicatorResult<'heap'>),
						checkRSS: jest
							.fn()
							.mockResolvedValue({} as HealthIndicatorResult<'rss'>)
					}
				},
				{
					provide: DATABASE_HEALTH_INDICATOR,
					useValue: {
						isHealthy: jest
							.fn()
							.mockResolvedValue({} as HealthIndicatorResult<'database'>)
					} as Pick<DatabaseHealthIndicator, 'isHealthy'>
				},
				{
					provide: MailerHealthIndicator,
					useValue: {
						isHealthy: jest
							.fn()
							.mockResolvedValue({} as HealthIndicatorResult<'mailer'>)
					} as Pick<MailerHealthIndicator, 'isHealthy'>
				}
			]
		}).compile()

		healthController = module.get<HealthController>(HealthController)
		health = module.get<HealthCheckService>(HealthCheckService)
	})

	it('should return status ok', async () => {
		jest.spyOn(health, 'check').mockResolvedValue(upMock)

		const result = await healthController.check()

		expect(health.check).toHaveBeenCalledWith([
			expect.any(Function),
			expect.any(Function),
			expect.any(Function),
			expect.any(Function),
			expect.any(Function)
		])

		expect(result).toEqual(upMock)
	})

	it('should return status error', async () => {
		jest.spyOn(health, 'check').mockResolvedValue(downMock)

		const result = await healthController.check()

		expect(result).toEqual(downMock)
	})
})
