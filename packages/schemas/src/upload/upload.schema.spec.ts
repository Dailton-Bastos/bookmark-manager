import { describe, expect, it } from '@jest/globals'
import { ZodError } from 'zod'
import { uploadInputSchema, uploadOutputSchema } from './upload.schema'

describe('UploadSchema', () => {
	it('should be defined', () => {
		expect(uploadInputSchema).toBeDefined()
	})

	it('should validate a valid upload output object', () => {
		const validOutput = { url: '/assets/images/file.jpg' }
		const result = uploadOutputSchema.safeParse(validOutput)
		expect(result.success).toBe(true)
	})

	it('should fail validation for a non-image file', () => {
		const nonImageFile = new File(['dummy content'], 'file.txt', {
			type: 'text/plain'
		})
		const result = uploadInputSchema.safeParse(nonImageFile)
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
		}
	})

	it('should fail validation for an invalid upload object', () => {
		const invalidUpload = {
			filename: 'file.jpg',
			mimetype: 'image/jpeg',
			size: 1024
		}

		const result = uploadOutputSchema.safeParse(invalidUpload)

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBeInstanceOf(ZodError)
		}
	})
})
