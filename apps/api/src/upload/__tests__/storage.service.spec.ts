import { Test, TestingModule } from '@nestjs/testing'
import { StorageService } from '../storage.service'

describe('StorageService', () => {
	let service: StorageService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [StorageService]
		}).compile()

		service = module.get<StorageService>(StorageService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	it('should save a file and return the file name and path', async () => {
		const mockFile = new File(['test content'], 'test-image.png', {
			type: 'image/png'
		})
		const subFolder = 'test-folder'

		const result = await service.saveFile(mockFile, subFolder)

		expect(result).toHaveProperty('fileName')
		expect(result).toHaveProperty('filePath')
		expect(result.filePath).toContain(subFolder)
	})

	it('should throw an error for non-image files', async () => {
		const mockFile = new File(['test content'], 'test-document.txt', {
			type: 'text/plain'
		})
		const subFolder = 'test-folder'

		await expect(service.saveFile(mockFile, subFolder)).rejects.toThrow(
			'Invalid file type. Only image files are allowed.'
		)
	})
})
