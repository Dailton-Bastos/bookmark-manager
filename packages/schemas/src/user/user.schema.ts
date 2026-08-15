import z from 'zod'

export const userProfileSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.email(),
	emailVerified: z.boolean(),
	image: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
})

export const updateUserProfileSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, { message: 'Name is required' })
		.max(100, { message: 'Name must be at most 100 characters' }),
	image: z.string().nullable().optional()
})

export type UserProfile = z.infer<typeof userProfileSchema>
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
