import { ZodError } from 'zod'
import { loginSchema } from './auth.schema'

describe('AuthSchema', () => {
	it('should validate a valid login object', () => {
		const validLogin = {
			email: 'test@example.com',
			password: 'password123'
		}

		const result = loginSchema.safeParse(validLogin)

		expect(result.success).toBe(true)
		expect(result.data?.email).toBe('test@example.com')
		expect(result.data?.password).toBe('password123')
	})

	it('should fail validation for an invalid login object', () => {
		const invalidLogin = {
			email: 'invalid-email',
			password: ''
		}

		const result = loginSchema.safeParse(invalidLogin)

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
			expect(result.error.issues.length).toBe(2)
			expect(result.error.issues[0]?.code).toBe('invalid_format')
			expect(result.error.issues[1]?.code).toBe('too_small')
		}
	})
})
