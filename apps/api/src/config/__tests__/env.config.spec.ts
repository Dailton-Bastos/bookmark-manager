import { validate } from '../env.config'

describe('EnvConfig', () => {
	describe('validate', () => {
		it('should validate valid config', () => {
			const config = {
				NODE_ENV: 'development',
				PORT: '3000',
				HOST: 'localhost',
				DATABASE_HOST: 'localhost',
				DATABASE_PORT: '5432',
				DATABASE_USER: 'user',
				DATABASE_PASSWORD: 'password',
				DATABASE_NAME: 'database',
				DATABASE_URL: 'postgres://user:password@localhost:5432/database',
				BETTER_AUTH_URL: 'http://localhost:3001',
				BETTER_AUTH_SECRET: 'secret'
			}

			expect(() => validate(config)).not.toThrow()
		})
		it('should throw error for invalid NODE_ENV', () => {
			const config = {
				NODE_ENV: 'invalid',
				PORT: '3000',
				HOST: 'localhost',
				DATABASE_HOST: 'localhost',
				DATABASE_PORT: '5432',
				DATABASE_USER: 'user',
				DATABASE_PASSWORD: 'password',
				DATABASE_NAME: 'database',
				DATABASE_URL: ''
			}

			expect(() => validate(config)).toThrow(
				"NODE_ENV must be one of 'development', 'production', or 'test'"
			)
		})
		it('should throw error for missing required fields', () => {
			const config = {
				NODE_ENV: 'development',
				PORT: '3000',
				HOST: 'localhost'
			}

			expect(() => validate(config)).toThrow(/Invalid environment variables/)
		})
	})
})
