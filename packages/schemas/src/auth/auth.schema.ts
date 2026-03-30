import z from 'zod'

export const loginSchema = z.object({
	email: z.email('Enter a valid email address'),
	password: z.string().min(1, 'Password is required')
})

export const signupSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters long'),
	email: z.email('Please enter a valid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters long')
		.max(100, 'Password must be less than 100 characters long')
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
