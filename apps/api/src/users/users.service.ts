import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ORPCError } from '@orpc/nest'
import type {
	RequestPasswordResetFormData,
	ResetPasswordFormData,
	UpdateUserPasswordInput,
	UpdateUserProfileInput,
	UserProfile
} from '@repo/schemas'
import { AuthService } from '@thallesp/nestjs-better-auth'
import { APIError } from 'better-auth'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres/driver'
import { CacheProvider } from '../cache/cache.provider'
import { schema } from '../database/schemas'
import { EnvService } from '../env/env.service'
import {
	RESET_PASSWORD_CACHE_KEY,
	RESET_PASSWORD_TOKEN_CACHE_KEY,
	USER_PROFILE_CACHE_KEY
} from '../shared/constants/cache'
import { DATABASE_CONNECTION } from '../shared/constants/database'

@Injectable()
export class UsersService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		private readonly db: NodePgDatabase<typeof schema>,
		private readonly cacheProvider: CacheProvider,
		private readonly authService: AuthService,
		private readonly env: EnvService
	) {}

	async getProfile(userId: string): Promise<UserProfile | null> {
		const cacheKey = `${USER_PROFILE_CACHE_KEY}_${userId}`
		const ttl = 3_600_000 // Cache for 1 hour in milliseconds

		// Check if the profile is cached
		const cachedProfile = await this.cacheProvider.get<UserProfile | null>(
			cacheKey
		)

		if (cachedProfile !== undefined) return cachedProfile

		// Fetch the user profile from the database
		const [profile = null] = await this.db
			.select()
			.from(schema.users)
			.where(eq(schema.users.id, userId))

		if (!profile) {
			await this.cacheProvider.set<null>(cacheKey, null, ttl)

			return null
		}

		// Cache the user profile for future requests
		await this.cacheProvider.set<UserProfile>(cacheKey, profile, ttl)

		return profile
	}

	async updateProfile(
		userId: string,
		updatedProfile: UpdateUserProfileInput
	): Promise<UserProfile | null> {
		const cacheKey = `${USER_PROFILE_CACHE_KEY}_${userId}`
		const ttl = 3_600_000 // Cache for 1 hour in milliseconds

		const existingProfile = await this.getProfile(userId)

		if (!existingProfile) {
			await this.cacheProvider.set<null>(cacheKey, null, ttl)

			throw new NotFoundException('User profile not found for the provided ID')
		}

		// Update the user profile in the database
		const [profile = null] = await this.db
			.update(schema.users)
			.set(updatedProfile)
			.where(eq(schema.users.id, userId))
			.returning()

		if (profile === null) {
			await this.cacheProvider.set<null>(cacheKey, null, ttl)

			return null
		}

		// Cache the updated user profile for future requests
		await this.cacheProvider.set<UserProfile>(cacheKey, profile, ttl)

		return profile
	}

	async updatePassword(
		userId: string,
		{
			currentPassword,
			newPassword,
			confirmNewPassword,
			revokeOtherSessions = true
		}: UpdateUserPasswordInput,
		headers: Record<string, string>
	): Promise<void> {
		const cacheKey = `${USER_PROFILE_CACHE_KEY}_${userId}`
		const ttl = 3_600_000 // Cache for 1 hour in milliseconds

		if (newPassword !== confirmNewPassword) {
			throw new BadRequestException(
				'New password and confirm password do not match'
			)
		}

		const existingProfile = await this.getProfile(userId)

		if (!existingProfile) {
			await this.cacheProvider.set<null>(cacheKey, null, ttl)

			throw new NotFoundException('User profile not found for the provided ID')
		}

		try {
			await this.authService.api.changePassword({
				body: {
					newPassword,
					currentPassword,
					revokeOtherSessions
				},
				headers
			})
		} catch (error) {
			if (error instanceof APIError) {
				if (error.status === 'BAD_REQUEST') {
					throw new BadRequestException('Current password is incorrect')
				}
			}

			throw new ORPCError('INTERNAL_ERROR', {
				message: 'An error occurred while updating the password'
			})
		}
	}

	async requestPasswordReset({
		email
	}: RequestPasswordResetFormData): Promise<void> {
		const cacheKey = `${RESET_PASSWORD_CACHE_KEY}_${email}`
		const ttl = 3_600_000 // Cache for 1 hour in milliseconds

		// Check if the password reset request is already cached
		const cachedRequest = await this.cacheProvider.get<string>(cacheKey)

		if (cachedRequest) {
			throw new BadRequestException(
				'Password reset request already sent. Please check your email for the reset link.'
			)
		}

		const redirectTo = this.env.get('UI_URL_RESET_PASSWORD_REDIRECT')

		try {
			await this.authService.api.requestPasswordReset({
				body: { email, redirectTo }
			})

			// Cache the email for future requests
			await this.cacheProvider.set<string>(cacheKey, email, ttl)
		} catch {
			throw new ORPCError('INTERNAL_ERROR', {
				message: 'An error occurred while requesting password reset'
			})
		}
	}

	async resetPassword({
		token,
		newPassword,
		confirmNewPassword
	}: ResetPasswordFormData): Promise<void> {
		const cacheKey = `${RESET_PASSWORD_TOKEN_CACHE_KEY}_${token}`

		const ttl = 3_600_000 // Cache for 1 hour in milliseconds

		if (newPassword !== confirmNewPassword) {
			throw new BadRequestException(
				'New password and confirm password do not match'
			)
		}

		// Check if the password reset token is already cached
		const cachedRequest = await this.cacheProvider.get<string>(cacheKey)

		if (cachedRequest) return // Token already used, no need to reset again

		try {
			await this.authService.api.resetPassword({
				body: { token, newPassword }
			})

			// Cache the token for future requests
			await this.cacheProvider.set<string>(cacheKey, token, ttl)
		} catch (error) {
			if (error instanceof APIError) {
				if (error.status === 'BAD_REQUEST') {
					throw new BadRequestException(
						error.message || 'Invalid or expired password reset token'
					)
				}
			}
			throw new ORPCError('INTERNAL_ERROR', {
				message: 'An error occurred while resetting the password'
			})
		}
	}
}
