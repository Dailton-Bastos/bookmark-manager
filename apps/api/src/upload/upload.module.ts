import { Module } from '@nestjs/common'
import { StorageService } from './storage.service'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'

@Module({
	providers: [UploadService, StorageService],
	controllers: [UploadController]
})
export class UploadModule {}
