import type { BaseUserSession } from '@thallesp/nestjs-better-auth'

export const mockUser = {
	id: 'user-id',
	email: 'test@example.com',
	name: 'Test User'
} as BaseUserSession['user']
