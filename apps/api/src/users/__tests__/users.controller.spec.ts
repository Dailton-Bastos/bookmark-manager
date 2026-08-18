import { Test, TestingModule } from '@nestjs/testing'
import { implement } from '@orpc/nest'
import { contract } from '@repo/contract'
import { mockUserSession, userMock } from '../__mocks__/user.mock'
import { UsersController } from '../users.controller'
import { UsersService } from '../users.service'

const handlerMock = jest.fn()

jest.mock('@orpc/nest', () => ({
	Implement: () => jest.fn(),
	implement: jest.fn(),
	ORPCError: class MockORPCError extends Error {
		code: string

		constructor(code: string, options?: { message?: string }) {
			super(options?.message)
			this.code = code
		}
	}
}))

jest.mock('better-auth', () => ({
	APIError: jest.fn()
}))

jest.mock('@repo/contract', () => ({
	contract: {
		user: {
			getProfile: 'user.getProfile',
			updateProfile: 'user.updateProfile',
			updatePassword: 'user.updatePassword',
			requestPasswordReset: 'user.requestPasswordReset'
		}
	}
}))

jest.mock('@thallesp/nestjs-better-auth', () => ({
	Session: () => jest.fn(),
	AllowAnonymous: () => jest.fn()
}))

describe('UsersController', () => {
	let controller: UsersController
	let usersServiceMock: {
		getProfile: jest.Mock
		updateProfile: jest.Mock
		updatePassword: jest.Mock
		requestPasswordReset: jest.Mock
	}

	beforeEach(async () => {
		handlerMock.mockReset()
		;(implement as jest.Mock).mockReset()
		;(implement as jest.Mock).mockReturnValue({ handler: handlerMock })

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: {
						getProfile: jest.fn(),
						updateProfile: jest.fn(),
						updatePassword: jest.fn(),
						requestPasswordReset: jest.fn()
					}
				}
			]
		}).compile()

		controller = module.get<UsersController>(UsersController)
		usersServiceMock = module.get(UsersService)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
		expect(usersServiceMock).toBeDefined()
	})

	it('should get user profile correctly', async () => {
		usersServiceMock.getProfile.mockResolvedValue(userMock)
		handlerMock.mockImplementation(async (resolver) => {
			return resolver()
		})

		const result = await controller.getProfile(mockUserSession)

		expect(implement).toHaveBeenCalledWith(contract.user.getProfile)
		expect(usersServiceMock.getProfile).toHaveBeenCalledWith(
			mockUserSession.user.id
		)
		expect(handlerMock).toHaveBeenCalled()
		expect(result).toEqual(userMock)
	})

	it('should throw NOT_FOUND error when user profile is not found', async () => {
		usersServiceMock.getProfile.mockResolvedValue(null)
		handlerMock.mockImplementation(async (resolver) => {
			return resolver()
		})

		await expect(controller.getProfile(mockUserSession)).rejects.toThrow(
			expect.objectContaining({
				code: 'NOT_FOUND',
				message: 'User profile not found for the provided ID'
			})
		)

		expect(implement).toHaveBeenCalledWith(contract.user.getProfile)
		expect(usersServiceMock.getProfile).toHaveBeenCalledWith(
			mockUserSession.user.id
		)
		expect(handlerMock).toHaveBeenCalled()
	})

	it('should update user profile correctly', async () => {
		const updatedUserMock = { ...userMock, name: 'Updated Name' }
		usersServiceMock.updateProfile.mockResolvedValue(updatedUserMock)
		handlerMock.mockImplementation(async (resolver) => {
			return resolver({ input: { name: 'Updated Name', image: null } })
		})

		const result = await controller.updateProfile(mockUserSession)

		expect(implement).toHaveBeenCalledWith(contract.user.updateProfile)
		expect(usersServiceMock.updateProfile).toHaveBeenCalledWith(
			mockUserSession.user.id,
			{ name: 'Updated Name', image: null }
		)
		expect(handlerMock).toHaveBeenCalled()
		expect(result).toEqual(updatedUserMock)
	})

	it('should throw NOT_FOUND error when updating a non-existent user profile', async () => {
		usersServiceMock.updateProfile.mockResolvedValue(null)
		handlerMock.mockImplementation(async (resolver) => {
			return resolver({ input: { name: 'Updated Name', image: null } })
		})

		await expect(controller.updateProfile(mockUserSession)).rejects.toThrow(
			expect.objectContaining({
				code: 'NOT_FOUND',
				message: 'User profile not found for the provided ID'
			})
		)

		expect(implement).toHaveBeenCalledWith(contract.user.updateProfile)
		expect(usersServiceMock.updateProfile).toHaveBeenCalledWith(
			mockUserSession.user.id,
			{ name: 'Updated Name', image: null }
		)
		expect(handlerMock).toHaveBeenCalled()
	})

	it('should update user password correctly', async () => {
		usersServiceMock.updatePassword.mockResolvedValue(true)
		handlerMock.mockImplementation(async (resolver) => {
			return resolver({
				input: {
					currentPassword: 'old',
					newPassword: 'new',
					confirmNewPassword: 'new',
					revokeOtherSessions: true
				}
			})
		})

		const headersMock = { 'user-agent': 'test-agent' }
		const result = await controller.updatePassword(mockUserSession, headersMock)

		expect(implement).toHaveBeenCalledWith(contract.user.updatePassword)
		expect(usersServiceMock.updatePassword).toHaveBeenCalledWith(
			mockUserSession.user.id,
			{
				currentPassword: 'old',
				newPassword: 'new',
				confirmNewPassword: 'new',
				revokeOtherSessions: true
			},
			headersMock
		)
		expect(handlerMock).toHaveBeenCalled()
		expect(result).toBeUndefined()
	})

	it('should request password reset correctly', async () => {
		usersServiceMock.requestPasswordReset.mockResolvedValue(true)
		handlerMock.mockImplementation(async (resolver) => {
			return resolver({ input: { email: 'john.doe@example.com' } })
		})

		const result = await controller.requestPasswordReset()

		expect(implement).toHaveBeenCalledWith(contract.user.requestPasswordReset)
		expect(usersServiceMock.requestPasswordReset).toHaveBeenCalledWith({
			email: 'john.doe@example.com'
		})
		expect(handlerMock).toHaveBeenCalled()
		expect(result).toBeUndefined()
	})
})
