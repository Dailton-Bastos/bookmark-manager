import { describe, expect, it } from '@jest/globals'
import { ZodError } from 'zod'
import { uploadInputSchema, uploadOutputSchema } from './upload.schema'

describe('UploadSchema', () => {
	it('should be defined', () => {
		expect(uploadInputSchema).toBeDefined()
	})

	it('should validate a valid upload object', async () => {
		const validUpload = {
			filename: 'file.jpg',
			mimetype: 'image/jpeg',
			size: 1024
		}

		const file = new File(['dummy content'], validUpload.filename, {
			type: validUpload.mimetype
		})

		const result = uploadInputSchema.safeParse(file)

		expect(result.success).toBe(true)

		if (result.success) {
			expect(await result.data.arrayBuffer()).toEqual(await file.arrayBuffer())
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
