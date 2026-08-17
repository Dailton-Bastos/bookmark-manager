import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '@thallesp/nestjs-better-auth'
import { APIError } from 'better-auth'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { CacheProvider } from '../../cache/cache.provider'
import { schema } from '../../database/schemas'
import { USER_PROFILE_CACHE_KEY } from '../../shared/constants/cache'
import { DATABASE_CONNECTION } from '../../shared/constants/database'
import { userMock } from '../__mocks__/user.mock'
import { UsersService } from '../users.service'

jest.mock('@orpc/nest', () => ({
	ORPCError: class MockORPCError extends Error {
		code: string

		constructor(code: string, options?: { message?: string }) {
			super(options?.message)
			this.code = code
		}
	}
}))

jest.mock('@thallesp/nestjs-better-auth', () => ({
	AuthService: () => jest.fn()
}))

jest.mock('better-auth', () => ({
	APIError: class MockAPIError extends Error {
		status: string

		constructor(status: string, options?: { message?: string }) {
			super(options?.message)
			this.name = 'APIError'
			this.status = status
		}
	}
}))

describe('UsersService', () => {
	let service: UsersService
	let cacheManager: Cache
	let cacheProvider: CacheProvider
	let authService: AuthService
	let db: NodePgDatabase<typeof schema>
	let mockDb: {
		select: jest.Mock
		returning: jest.Mock
		update: jest.Mock
		set: jest.Mock
	}

	beforeEach(async () => {
		mockDb = {
			returning: jest.fn().mockResolvedValue([]),
			select: jest.fn().mockReturnThis(),
			update: jest.fn().mockReturnThis(),
			set: jest.fn().mockReturnThis()
		}

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				CacheProvider,
				AuthService,
				{
					provide: DATABASE_CONNECTION,
					useValue: mockDb as unknown as NodePgDatabase<typeof schema>
				},
				{
					provide: CACHE_MANAGER,
					useValue: {
						get: jest.fn(),
						set: jest.fn()
					} as unknown as Cache
				},
				{
					provide: AuthService,
					useValue: {
						api: {
							changePassword: jest.fn()
						}
					}
				}
			]
		}).compile()

		service = module.get<UsersService>(UsersService)
		db = module.get<NodePgDatabase<typeof schema>>(DATABASE_CONNECTION)
		cacheProvider = module.get<CacheProvider>(CacheProvider)
		cacheManager = module.get<Cache>(CACHE_MANAGER)
		authService = module.get<AuthService>(AuthService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
		expect(db).toBeDefined()
		expect(cacheManager).toBeDefined()
		expect(cacheProvider).toBeDefined()
		expect(authService).toBeDefined()
	})

	describe('getProfile', () => {
		it('should return cached profile if available', async () => {
			const userId = 'user-123'
			const cachedProfile = userMock

			jest.spyOn(cacheProvider, 'get').mockResolvedValue(cachedProfile)

			const result = await service.getProfile(userId)

			expect(result).toEqual(cachedProfile)
			expect(cacheProvider.get).toHaveBeenCalledWith(
				`${USER_PROFILE_CACHE_KEY}_${userId}`
			)
		})

		it('should return null if cached profile is not available', async () => {
			const userId = 'user-123'

			jest.spyOn(cacheProvider, 'get').mockResolvedValue(null)

			const result = await service.getProfile(userId)

			expect(result).toBeNull()
			expect(cacheProvider.get).toHaveBeenCalledWith(
				`${USER_PROFILE_CACHE_KEY}_${userId}`
			)
		})

		it('should fetch profile from database if not cached', async () => {
			const userId = 'user-123'
			const dbProfile = userMock
			const select = db.select as jest.Mock

			jest.spyOn(cacheProvider, 'get').mockResolvedValue(undefined)

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValue([dbProfile])
			})

			const result = await service.getProfile(userId)

			expect(result).toEqual(dbProfile)
			expect(cacheManager.set).toHaveBeenCalledWith(
				`${USER_PROFILE_CACHE_KEY}_${userId}`,
				dbProfile,
				3_600_000
			)
		})

		it('should return null and cache null if profile not found in database', async () => {
			const userId = 'user-123'
			const select = db.select as jest.Mock

			jest.spyOn(cacheProvider, 'get').mockResolvedValue(undefined)

			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValue([])
			})

			const result = await service.getProfile(userId)

			expect(result).toBeNull()
			expect(cacheManager.set).toHaveBeenCalledWith(
				`${USER_PROFILE_CACHE_KEY}_${userId}`,
				null,
				3_600_000
			)
		})
	})

	describe('updateProfile', () => {
		it('should update profile and cache the updated profile', async () => {
			const userId = 'user-123'
			const updatedProfile = { name: 'Updated Name' }
			const dbProfile = { ...userMock, ...updatedProfile }
			const select = db.select as jest.Mock
			const update = db.update as jest.Mock

			jest.spyOn(cacheProvider, 'get').mockResolvedValue(undefined)

			// Mock the select query to return the existing profile
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValue([userMock])
			})

			update.mockReturnValueOnce({
				set: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				returning: jest.fn().mockResolvedValue([dbProfile])
			})

			const result = await service.updateProfile(userId, updatedProfile)

			expect(result).toEqual(dbProfile)
			expect(cacheManager.set).toHaveBeenCalledWith(
				`${USER_PROFILE_CACHE_KEY}_${userId}`,
				dbProfile,
				3_600_000
			)
		})

		it('should throw NotFoundException if profile does not exist', async () => {
			const userId = 'user-123'
			const updatedProfile = { name: 'Updated Name' }

			jest.spyOn(cacheProvider, 'get').mockResolvedValue(undefined)

			const select = db.select as jest.Mock
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValue([])
			})

			await expect(
				service.updateProfile(userId, updatedProfile)
			).rejects.toThrow('User profile not found for the provided ID')

			expect(cacheManager.set).toHaveBeenCalledWith(
				`${USER_PROFILE_CACHE_KEY}_${userId}`,
				null,
				3_600_000
			)
			expect(db.update).not.toHaveBeenCalled()
		})

		it('should return null and cache null if update fails', async () => {
			const userId = 'user-123'
			const updatedProfile = { name: 'Updated Name' }

			jest.spyOn(cacheProvider, 'get').mockResolvedValue(undefined)

			const select = db.select as jest.Mock
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValue([userMock])
			})

			const update = db.update as jest.Mock
			update.mockReturnValueOnce({
				set: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				returning: jest.fn().mockResolvedValue([])
			})

			const result = await service.updateProfile(userId, updatedProfile)

			expect(result).toBeNull()
			expect(cacheManager.set).toHaveBeenCalledWith(
				`${USER_PROFILE_CACHE_KEY}_${userId}`,
				null,
				3_600_000
			)
		})
	})

	describe('updatePassword', () => {
		it('should throw BadRequestException if new password and confirm new password do not match', async () => {
			const userId = 'user-123'
			const input = {
				currentPassword: 'currentPass',
				newPassword: 'newPass123',
				confirmNewPassword: 'differentPass123',
				revokeOtherSessions: true
			}
			const headers = {}

			await expect(
				service.updatePassword(userId, input, headers)
			).rejects.toThrow('New password and confirm password do not match')
		})

		it('should throw NotFoundException if user profile does not exist', async () => {
			const userId = 'user-123'
			const input = {
				currentPassword: 'currentPass',
				newPassword: 'newPass123',
				confirmNewPassword: 'newPass123',
				revokeOtherSessions: true
			}
			const headers = {}

			jest.spyOn(cacheProvider, 'get').mockResolvedValue(undefined)

			// Mock the select query to return no profile
			const select = db.select as jest.Mock
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValue([])
			})

			await expect(
				service.updatePassword(userId, input, headers)
			).rejects.toThrow('User profile not found for the provided ID')
		})

		it('should call authService.api.changePassword with correct parameters', async () => {
			const userId = 'user-123'
			const input = {
				currentPassword: 'currentPass',
				newPassword: 'newPass123',
				confirmNewPassword: 'newPass123',
				revokeOtherSessions: true
			}
			const headers = {}

			jest.spyOn(cacheProvider, 'get').mockResolvedValue(undefined)

			// Mock the select query to return the existing profile
			const select = db.select as jest.Mock
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValue([userMock])
			})

			await service.updatePassword(userId, input, headers)

			expect(authService.api.changePassword).toHaveBeenCalledWith({
				body: {
					currentPassword: input.currentPassword,
					newPassword: input.newPassword,
					revokeOtherSessions: input.revokeOtherSessions
				},
				headers
			})
		})

		it('should throw BadRequestException if authService.api.changePassword fails with BAD_REQUEST', async () => {
			const userId = 'user-123'
			const input = {
				currentPassword: 'currentPass',
				newPassword: 'newPass123',
				confirmNewPassword: 'newPass123',
				revokeOtherSessions: true
			}
			const headers = {}

			jest.spyOn(cacheProvider, 'get').mockResolvedValue(undefined)

			const select = db.select as jest.Mock
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValue([userMock])
			})

			jest.spyOn(authService.api, 'changePassword').mockRejectedValue(
				new APIError('BAD_REQUEST', {
					message: 'Invalid current password'
				})
			)

			const promise = service.updatePassword(userId, input, headers)

			await expect(promise).rejects.toThrow(BadRequestException)
			await expect(promise).rejects.toThrow('Current password is incorrect')
		})

		it('should throw error if authService.api.changePassword fails', async () => {
			const userId = 'user-123'
			const input = {
				currentPassword: 'currentPass',
				newPassword: 'newPass123',
				confirmNewPassword: 'newPass123',
				revokeOtherSessions: true
			}
			const headers = {}

			jest.spyOn(cacheProvider, 'get').mockResolvedValue(undefined)

			// Mock the select query to return the existing profile
			const select = db.select as jest.Mock
			select.mockReturnValueOnce({
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockResolvedValue([userMock])
			})

			// Mock authService.api.changePassword to throw an error
			const errorMessage = 'An error occurred while updating the password'
			jest
				.spyOn(authService.api, 'changePassword')
				.mockRejectedValue(new Error(errorMessage))

			await expect(
				service.updatePassword(userId, input, headers)
			).rejects.toThrow(errorMessage)
		})
	})
})
