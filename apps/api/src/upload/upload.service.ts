import { Injectable } from '@nestjs/common'
import { StorageService } from './storage.service'

@Injectable()
export class UploadService {
	constructor(private readonly storageService: StorageService) {}

	async uploadImage(file: File) {
		const { fileName } = await this.storageService.saveFile(file, 'images')

		return { url: `/assets/images/${fileName}` }
	}
}
