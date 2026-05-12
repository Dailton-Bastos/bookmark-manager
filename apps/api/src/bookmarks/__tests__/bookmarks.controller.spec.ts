import { Test, TestingModule } from '@nestjs/testing'
import { implement, ORPCError } from '@orpc/nest'
import { contract } from '@repo/contract'
import type { ListBookmarks } from '@repo/schemas'
import { mockMetaPagination } from '../../pagination/__mocks__/pagination.mock'
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
			create: 'bookmark.create',
			list: 'bookmark.list',
			archiveOrUnarchive: 'bookmark.archiveOrUnarchive'
		}
	}
}))

jest.mock('@thallesp/nestjs-better-auth', () => ({
	Session: () => jest.fn()
}))

describe('BookmarksController', () => {
	let controller: BookmarksController
	let bookmarksServiceMock: {
		create: jest.Mock
		list: jest.Mock
		archiveOrUnarchive: jest.Mock
	}

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
						create: jest.fn(),
						list: jest.fn(),
						archiveOrUnarchive: jest.fn()
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

	it('should throw error when service fails to create bookmark', async () => {
		bookmarksServiceMock.create.mockResolvedValue(null)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: mockCreateBookmarkInput })
		)

		await expect(controller.create(mockUserSession)).rejects.toBeInstanceOf(
			ORPCError
		)
		await expect(controller.create(mockUserSession)).rejects.toHaveProperty(
			'message',
			'Failed to create bookmark'
		)
	})

	it('should return a list of bookmarks', async () => {
		const mockListBookmarks: ListBookmarks = {
			data: [mockBookmark],
			meta: {
				...mockMetaPagination
			}
		}
		bookmarksServiceMock.list.mockResolvedValue(mockListBookmarks)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: { limit: 10, page: 1, order: 'desc' } })
		)

		const result = await controller.list(mockUserSession)

		expect(implement).toHaveBeenCalledWith(contract.bookmark.list)
		expect(bookmarksServiceMock.list).toHaveBeenCalledWith(
			{ limit: 10, page: 1, order: 'desc' },
			mockUserSession.user.id
		)
		expect(result).toEqual(mockListBookmarks)
	})

	it('should archive/unarchive a bookmark successfully', async () => {
		bookmarksServiceMock.archiveOrUnarchive.mockResolvedValue(mockBookmark)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: { id: 1, isArchived: true } })
		)

		const result = await controller.archiveOrUnarchive(mockUserSession)

		expect(implement).toHaveBeenCalledWith(contract.bookmark.archiveOrUnarchive)
		expect(bookmarksServiceMock.archiveOrUnarchive).toHaveBeenCalledWith(
			{ id: 1, isArchived: true },
			mockUserSession.user.id
		)
		expect(result).toEqual(mockBookmark)
	})

	it('should throw error when service fails to archive/unarchive bookmark', async () => {
		bookmarksServiceMock.archiveOrUnarchive.mockResolvedValue(null)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: { id: 1, isArchived: true } })
		)

		await expect(
			controller.archiveOrUnarchive(mockUserSession)
		).rejects.toBeInstanceOf(ORPCError)
		await expect(
			controller.archiveOrUnarchive(mockUserSession)
		).rejects.toHaveProperty('message', 'Failed to archive/unarchive bookmark')
	})
})
