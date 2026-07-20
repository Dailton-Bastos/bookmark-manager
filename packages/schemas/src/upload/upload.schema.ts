import z from 'zod'

export const fileSchema = z
	.file()
	.max(5 * 1024 * 1024, 'File size exceeds the maximum limit of 5MB.')
	.mime(
		['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
		'Invalid file type. Please upload a JPEG, JPG, PNG, or WebP image.'
	)

export const uploadInputSchema = fileSchema

export const uploadOutputSchema = z.object({
	url: z.string()
})

export type UploadSchema = z.infer<typeof uploadInputSchema>
