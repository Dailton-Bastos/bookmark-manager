import { EnvService } from '../../env/env.service'
import { helpersHandlebars } from '../helpers-handlebars'

describe('helpers-handlebars', () => {
	it('should return an object with the correct helpers', () => {
		const envService = {} as EnvService

		const helpers = helpersHandlebars(envService)

		expect(helpers).toHaveProperty('logoUrl')
		expect(typeof helpers.logoUrl).toBe('function')
	})

	it('should return the correct logoUrl', () => {
		const envService = {
			get: jest.fn().mockReturnValue('http://localhost:3000')
		} as unknown as EnvService

		const helpers = helpersHandlebars(envService)

		expect(helpers.logoUrl()).toBe('http://localhost:3000/static/logo.svg')
	})
})
