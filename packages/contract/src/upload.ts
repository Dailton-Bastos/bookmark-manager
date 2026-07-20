import { oc } from '@orpc/contract'
import { uploadInputSchema, uploadOutputSchema } from '@repo/schemas'

export const uploadContract = oc
	.route({
		method: 'POST',
		path: '/upload/image',
		summary: 'Upload an image file',
		tags: ['Upload']
	})
	.input(uploadInputSchema)
	.output(uploadOutputSchema)
