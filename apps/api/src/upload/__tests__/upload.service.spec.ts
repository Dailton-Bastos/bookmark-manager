import { Test, TestingModule } from '@nestjs/testing'
import { StorageService } from '../storage.service'
import { UploadService } from '../upload.service'

describe('UploadService', () => {
	let service: UploadService
	let storageService: StorageService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UploadService,
				{
					provide: StorageService,
					useValue: {
						saveFile: jest.fn().mockResolvedValue({
							fileName: 'test-image.png',
							filePath: 'images/test-image.png'
						})
					}
				}
			]
		}).compile()

		service = module.get<UploadService>(UploadService)
		storageService = module.get<StorageService>(StorageService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
		expect(storageService).toBeDefined()
	})

	it('should upload an image and return the URL', async () => {
		const mockFile = new File(['test content'], 'test-image.png', {
			type: 'image/png'
		})

		const result = await service.uploadImage(mockFile)

		expect(storageService.saveFile).toHaveBeenCalledWith(mockFile, 'images')
		expect(result).toHaveProperty('url')
		expect(result.url).toContain('test-image')
	})
})
