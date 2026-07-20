import { Controller } from '@nestjs/common'
import { Implement, implement, ORPCError } from '@orpc/nest'
import { contract } from '@repo/contract'
import { UploadService } from './upload.service'

@Controller()
export class UploadController {
	constructor(private readonly uploadService: UploadService) {}

	@Implement(contract.upload.image)
	uploadImage() {
		return implement(contract.upload.image).handler(async ({ input }) => {
			const file = await this.uploadService.uploadImage(input)

			if (!file) {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: 'Failed to upload image. Please try again later.'
				})
			}

			return file
		})
	}
}
