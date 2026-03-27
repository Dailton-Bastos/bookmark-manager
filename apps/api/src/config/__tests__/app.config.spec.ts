import type { INestApplication } from '@nestjs/common'
import { appConfig } from '../app.config'

describe('appConfig', () => {
	it('should set the global prefix to "api"', () => {
		const mockApp = {
			setGlobalPrefix: jest.fn()
		} as unknown as INestApplication

		appConfig(mockApp)

		expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api')
	})
})
