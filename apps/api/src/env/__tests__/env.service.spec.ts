import { ConfigService } from '@nestjs/config/dist/config.service'
import { Test, TestingModule } from '@nestjs/testing'
import type { EnvConfig } from '../../config/env.config'
import { EnvService } from '../env.service'

describe('EnvService', () => {
	let configService: ConfigService<EnvConfig, true>
	let service: EnvService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [EnvService, ConfigService]
		}).compile()

		service = module.get<EnvService>(EnvService)
		configService = module.get<ConfigService<EnvConfig, true>>(ConfigService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	it('should return the value of the environment variable', () => {
		const key = 'NODE_ENV'
		const value = 'test'

		jest.spyOn(configService, 'get').mockReturnValue(value)

		expect(service.get(key)).toBe(value)
		expect(configService.get).toHaveBeenCalledWith(key, { infer: true })
	})

	it('should return undefined if the environment variable is not defined', () => {
		const key = 'UNDEFINED_ENV_VAR' as keyof EnvConfig

		jest.spyOn(configService, 'get').mockReturnValue(undefined)

		expect(service.get(key)).toBeUndefined()
		expect(configService.get).toHaveBeenCalledWith(key, { infer: true })
	})
})
