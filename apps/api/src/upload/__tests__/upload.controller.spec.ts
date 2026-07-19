import { Test, TestingModule } from '@nestjs/testing'
import { implement, ORPCError } from '@orpc/nest'
import { UploadController } from '../upload.controller'
import { UploadService } from '../upload.service'

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
		upload: {
			image: 'upload.image'
		}
	}
}))

jest.mock('@thallesp/nestjs-better-auth', () => ({
	Session: () => jest.fn()
}))

describe('UploadController', () => {
	let controller: UploadController
	let uploadServiceMock: { uploadImage: jest.Mock }

	beforeEach(async () => {
		handlerMock.mockReset()
		;(implement as jest.Mock).mockReset()
		;(implement as jest.Mock).mockReturnValue({ handler: handlerMock })

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UploadController],
			providers: [
				{
					provide: UploadService,
					useValue: {
						uploadImage: jest.fn()
					}
				}
			]
		}).compile()

		controller = module.get<UploadController>(UploadController)
		uploadServiceMock = module.get(UploadService)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
		expect(uploadServiceMock).toBeDefined()
	})

	it('should call uploadService.uploadImage when handler is invoked', async () => {
		const mockFile = { originalname: 'test.jpg', buffer: Buffer.from('test') }
		const mockResult = { url: 'http://example.com/test.jpg' }

		uploadServiceMock.uploadImage.mockResolvedValue(mockResult)

		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: mockFile })
		)

		const result = await controller.uploadImage()

		expect(uploadServiceMock.uploadImage).toHaveBeenCalledWith(mockFile)
		expect(result).toEqual(mockResult)
	})

	it('should throw ORPCError if uploadService.uploadImage throws an error', async () => {
		const mockFile = { originalname: 'test.jpg', buffer: Buffer.from('test') }

		uploadServiceMock.uploadImage.mockResolvedValue(null)

		handlerMock.mockImplementation(async (resolver) =>
			resolver({ input: mockFile })
		)

		await expect(controller.uploadImage()).rejects.toBeInstanceOf(ORPCError)
		await expect(controller.uploadImage()).rejects.toHaveProperty(
			'message',
			'Failed to upload image. Please try again later.'
		)
	})
})
