import { describe, expect, it } from '@jest/globals'
import { ZodError } from 'zod'
import {
	updateUserPasswordSchema,
	updateUserProfileSchema,
	userProfileSchema
} from './user.schema'

describe('UserSchema', () => {
	it('should be defined', () => {
		expect(userProfileSchema).toBeDefined()
		expect(updateUserProfileSchema).toBeDefined()
		expect(updateUserPasswordSchema).toBeDefined()
	})

	it('should validate a valid user profile object', () => {
		const validUserProfile = {
			id: '123',
			name: 'John Doe',
			email: 'john.doe@example.com',
			emailVerified: true,
			image: null,
			createdAt: new Date(),
			updatedAt: new Date()
		}
		expect(() => userProfileSchema.parse(validUserProfile)).not.toThrow()
	})

	it('should fail validation for an invalid user profile object', () => {
		const invalidUserProfile = {
			id: 123,
			name: '',
			email: 'invalid-email',
			emailVerified: 'not-a-boolean',
			image: 123,
			createdAt: 'not-a-date',
			updatedAt: 'not-a-date'
		}

		const result = userProfileSchema.safeParse(invalidUserProfile)
		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
			expect(result.error.issues.length).toBeGreaterThan(0)
		}
	})

	it('should validate a valid update user profile object', () => {
		const validUpdateUserProfile = {
			name: 'Jane Doe',
			image: null
		}
		expect(() =>
			updateUserProfileSchema.parse(validUpdateUserProfile)
		).not.toThrow()
	})

	it('should fail validation for an invalid update user profile object', () => {
		const invalidUpdateUserProfile = {
			name: '',
			image: 123
		}

		expect(() =>
			updateUserProfileSchema.parse(invalidUpdateUserProfile)
		).toThrow(ZodError)
	})

	it('should validate a valid update user password object', () => {
		const validUpdateUserPassword = {
			currentPassword: 'currentPassword123',
			newPassword: 'newPassword123',
			confirmNewPassword: 'newPassword123',
			revokeOtherSessions: true
		}
		expect(() =>
			updateUserPasswordSchema.parse(validUpdateUserPassword)
		).not.toThrow()
	})

	it('should fail validation for an invalid update user password object', () => {
		const invalidUpdateUserPassword = {
			currentPassword: '',
			newPassword: 'short',
			confirmNewPassword: 'different',
			revokeOtherSessions: 'not-a-boolean'
		}

		expect(() =>
			updateUserPasswordSchema.parse(invalidUpdateUserPassword)
		).toThrow(ZodError)
	})
})
