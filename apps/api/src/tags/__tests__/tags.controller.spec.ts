import { Test, TestingModule } from '@nestjs/testing'
import { implement } from '@orpc/nest'
import { contract } from '@repo/contract'
import { ListTags } from '@repo/schemas'
import { UserSession } from '@thallesp/nestjs-better-auth'
import { mockMetaPagination } from '../../pagination/__mocks__/pagination.mock'
import { tagWithBookmarkCount } from '../__mocks__/tag.mock'
import { TagsController } from '../tags.controller'
import { TagsService } from '../tags.service'

const handlerMock = jest.fn()

const mockUserSession = {
	user: { id: 'user-123', name: 'Test User', email: 'test@example.com' }
} as UserSession

jest.mock('@orpc/nest', () => ({
	Implement: () => jest.fn(),
	implement: jest.fn()
}))

jest.mock('@repo/contract', () => ({
	contract: {
		tag: {
			list: 'tag.list'
		}
	}
}))

jest.mock('@thallesp/nestjs-better-auth', () => ({
	Session: () => jest.fn()
}))

describe('TagsController', () => {
	let controller: TagsController
	let tagsServiceMock: {
		list: jest.Mock
	}

	beforeEach(async () => {
		handlerMock.mockReset()
		;(implement as jest.Mock).mockReset()
		;(implement as jest.Mock).mockReturnValue({ handler: handlerMock })

		const module: TestingModule = await Test.createTestingModule({
			controllers: [TagsController],
			providers: [
				{
					provide: TagsService,
					useValue: {
						list: jest.fn()
					}
				}
			]
		}).compile()

		controller = module.get<TagsController>(TagsController)
		tagsServiceMock = module.get(TagsService)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
		expect(tagsServiceMock).toBeDefined()
	})

	it('should return a list of tags', async () => {
		const mockListTags: ListTags = {
			data: [tagWithBookmarkCount],
			meta: {
				...mockMetaPagination
			}
		}
		tagsServiceMock.list.mockResolvedValue(mockListTags)
		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: { limit: 10, page: 1 } })
		)

		const result = await controller.list(mockUserSession)

		expect(implement).toHaveBeenCalledWith(contract.tag.list)
		expect(tagsServiceMock.list).toHaveBeenCalledWith(
			{ limit: 10, page: 1 },
			mockUserSession.user.id
		)
		expect(result).toEqual(mockListTags)
	})
})
