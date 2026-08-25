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

export const updateUserPasswordSchema = z
	.object({
		currentPassword: z
			.string()
			.min(1, { message: 'Current password is required' }),
		newPassword: z
			.string()
			.min(8, { message: 'New password must be at least 8 characters long' })
			.max(100, {
				message: 'New password must be less than 100 characters long'
			}),
		confirmNewPassword: z
			.string()
			.min(1, { message: 'Please confirm your new password' }),
		revokeOtherSessions: z.boolean().default(true)
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: 'Passwords do not match',
		path: ['confirmNewPassword']
	})

export type UserProfile = z.infer<typeof userProfileSchema>
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
export type UpdateUserPasswordInput = z.infer<typeof updateUserPasswordSchema>
