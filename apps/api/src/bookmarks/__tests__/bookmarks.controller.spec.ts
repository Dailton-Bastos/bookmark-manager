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
			archiveOrUnarchive: 'bookmark.archiveOrUnarchive',
			pinOrUnpin: 'bookmark.pinOrUnpin',
			visited: 'bookmark.visited',
			delete: 'bookmark.delete',
			update: 'bookmark.update'
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
		pinOrUnpin: jest.Mock
		visited: jest.Mock
		delete: jest.Mock
		update: jest.Mock
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
						archiveOrUnarchive: jest.fn(),
						pinOrUnpin: jest.fn(),
						visited: jest.fn(),
						delete: jest.fn(),
						update: jest.fn()
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
		).rejects.toHaveProperty('message', 'Bookmark not found or not accessible')
	})

	it('should pin/unpin a bookmark successfully', async () => {
		bookmarksServiceMock.pinOrUnpin.mockResolvedValue(mockBookmark)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: { id: 1, pinned: true } })
		)

		const result = await controller.pinOrUnpin(mockUserSession)

		expect(implement).toHaveBeenCalledWith(contract.bookmark.pinOrUnpin)
		expect(bookmarksServiceMock.pinOrUnpin).toHaveBeenCalledWith(
			{ id: 1, pinned: true },
			mockUserSession.user.id
		)
		expect(result).toEqual(mockBookmark)
	})

	it('should throw error when service fails to pin/unpin bookmark', async () => {
		bookmarksServiceMock.pinOrUnpin.mockResolvedValue(null)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: { id: 1, pinned: true } })
		)

		await expect(controller.pinOrUnpin(mockUserSession)).rejects.toBeInstanceOf(
			ORPCError
		)
		await expect(controller.pinOrUnpin(mockUserSession)).rejects.toHaveProperty(
			'message',
			'Bookmark not found or not accessible'
		)
	})

	it('should mark a bookmark as visited successfully', async () => {
		bookmarksServiceMock.visited.mockResolvedValue(mockBookmark)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: { id: 1 } })
		)

		const result = await controller.visited(mockUserSession)

		expect(implement).toHaveBeenCalledWith(contract.bookmark.visited)
		expect(bookmarksServiceMock.visited).toHaveBeenCalledWith(
			{ id: 1 },
			mockUserSession.user.id
		)
		expect(result).toEqual(mockBookmark)
	})

	it('should throw error when service fails to mark bookmark as visited', async () => {
		bookmarksServiceMock.visited.mockResolvedValue(null)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: { id: 1 } })
		)

		await expect(controller.visited(mockUserSession)).rejects.toBeInstanceOf(
			ORPCError
		)
		await expect(controller.visited(mockUserSession)).rejects.toHaveProperty(
			'message',
			'Bookmark not found or not accessible'
		)
	})

	it('should delete a bookmark successfully', async () => {
		bookmarksServiceMock.delete.mockResolvedValue(undefined)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: { id: 1 } })
		)

		const result = await controller.delete(mockUserSession)

		expect(implement).toHaveBeenCalledWith(contract.bookmark.delete)
		expect(bookmarksServiceMock.delete).toHaveBeenCalledWith(
			{ id: 1 },
			mockUserSession.user.id
		)
		expect(result).toEqual({ success: true })
	})

	it('should throw error when service fails to delete bookmark', async () => {
		bookmarksServiceMock.delete.mockResolvedValue(null)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: { id: 1 } })
		)

		await expect(controller.delete(mockUserSession)).rejects.toBeInstanceOf(
			ORPCError
		)
		await expect(controller.delete(mockUserSession)).rejects.toHaveProperty(
			'message',
			'Bookmark not found or not accessible'
		)
	})

	it('should update a bookmark successfully', async () => {
		const updateInput = {
			id: 1,
			title: 'Updated Bookmark',
			description: 'Updated description',
			url: 'https://updated-example.com',
			tags: ['TypeScript']
		}
		const updatedBookmark = {
			...mockBookmark,
			title: 'Updated Bookmark',
			description: 'Updated description',
			url: 'https://updated-example.com',
			tags: [{ id: 1, name: 'TypeScript' }]
		}

		bookmarksServiceMock.update.mockResolvedValue(updatedBookmark)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: updateInput })
		)

		const result = await controller.update(mockUserSession)

		expect(implement).toHaveBeenCalledWith(contract.bookmark.update)
		expect(bookmarksServiceMock.update).toHaveBeenCalledWith(
			updateInput,
			mockUserSession.user.id
		)
		expect(result).toEqual(updatedBookmark)
	})

	it('should throw error when service fails to update bookmark', async () => {
		bookmarksServiceMock.update.mockResolvedValue(null)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({
				input: {
					id: 1,
					title: 'Updated Bookmark',
					description: 'Updated description',
					url: 'https://updated-example.com'
				}
			})
		)

		await expect(controller.update(mockUserSession)).rejects.toBeInstanceOf(
			ORPCError
		)
		await expect(controller.update(mockUserSession)).rejects.toHaveProperty(
			'message',
			'Bookmark not found or not accessible'
		)
	})
})
