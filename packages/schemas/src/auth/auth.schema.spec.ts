import { ZodError } from 'zod'
import { loginSchema, signupSchema } from './auth.schema'

describe('AuthSchema', () => {
	describe('LoginSchema', () => {
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

				const emailIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'email'
				)
				const passwordIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'password'
				)

				expect(emailIssue?.code).toBe('invalid_format')
				expect(passwordIssue?.code).toBe('too_small')
			}
		})
	})

	describe('SignupSchema', () => {
		it('should validate a valid signup object', () => {
			const validSignup = {
				name: 'John Doe',
				email: 'john.doe@example.com',
				password: 'password123'
			}

			const result = signupSchema.safeParse(validSignup)

			expect(result.success).toBe(true)
			expect(result.data?.name).toBe('John Doe')
			expect(result.data?.email).toBe('john.doe@example.com')
			expect(result.data?.password).toBe('password123')
		})

		it('should fail validation for an invalid signup object', () => {
			const invalidSignup = {
				name: 'J',
				email: 'invalid-email',
				password: 'short'
			}

			const result = signupSchema.safeParse(invalidSignup)

			expect(result.success).toBe(false)

			if (!result.success) {
				expect(result.error).toBeInstanceOf(ZodError)
				expect(result.error.issues.length).toBe(3)

				const nameIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'name'
				)
				const emailIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'email'
				)
				const passwordIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'password'
				)

				expect(nameIssue?.code).toBe('too_small')
				expect(emailIssue?.code).toBe('invalid_format')
				expect(passwordIssue?.code).toBe('too_small')
			}
		})

		it('should fail validation for a signup object with a password that is too long', () => {
			const invalidSignup = {
				name: 'John Doe',
				email: 'john.doe@example.com',
				password: 'a'.repeat(101)
			}

			const result = signupSchema.safeParse(invalidSignup)

			expect(result.success).toBe(false)

			if (!result.success) {
				expect(result.error).toBeInstanceOf(ZodError)
				expect(result.error.issues.length).toBe(1)

				const passwordIssue = result.error.issues.find(
					(issue) => issue.path[0] === 'password'
				)

				expect(passwordIssue?.code).toBe('too_big')
			}
		})
	})
})
