import { Test, TestingModule } from '@nestjs/testing'
import { implement, ORPCError } from '@orpc/nest'
import { contract } from '@repo/contract'
import {
	mockBookmark,
	mockCreateBookmarkInput,
	mockUserSession
} from '../__mocks__/bookmark.mock'
import { BookmarksController } from '../bookmarks.controller'
import { BookmarksService } from '../bookmarks.service'

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

jest.mock('@repo/contract', () => ({
	contract: {
		bookmark: {
			create: 'bookmark.create'
		}
	}
}))

jest.mock('@thallesp/nestjs-better-auth', () => ({
	Session: () => jest.fn()
}))

describe('BookmarksController', () => {
	let controller: BookmarksController
	let bookmarksServiceMock: { create: jest.Mock }

	beforeEach(async () => {
		handlerMock.mockReset()
		;(implement as jest.Mock).mockReset()
		;(implement as jest.Mock).mockReturnValue({ handler: handlerMock })

		const module: TestingModule = await Test.createTestingModule({
			controllers: [BookmarksController],
			providers: [
				{
					provide: BookmarksService,
					useValue: {
						create: jest.fn()
					}
				}
			]
		}).compile()

		controller = module.get<BookmarksController>(BookmarksController)
		bookmarksServiceMock = module.get(BookmarksService)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
		expect(bookmarksServiceMock).toBeDefined()
	})

	it('should create a bookmark successfully', async () => {
		bookmarksServiceMock.create.mockResolvedValue(mockBookmark)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: mockCreateBookmarkInput })
		)

		const result = await controller.create(mockUserSession)

		expect(implement).toHaveBeenCalledWith(contract.bookmark.create)
		expect(bookmarksServiceMock.create).toHaveBeenCalledWith(
			mockCreateBookmarkInput,
			mockUserSession.user.id
		)
		expect(result).toEqual(mockBookmark)
	})

	it('should throw when service fails to create bookmark', async () => {
		bookmarksServiceMock.create.mockResolvedValue(null)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: mockCreateBookmarkInput })
		)

		try {
			await controller.create(mockUserSession)
			fail('Expected controller.create to throw')
		} catch (error) {
			expect(error).toBeInstanceOf(ORPCError)
			expect(error).toHaveProperty('message', 'Failed to create bookmark')
		}
	})
})
