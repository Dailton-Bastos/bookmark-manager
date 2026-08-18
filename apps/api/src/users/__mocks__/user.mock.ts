import type { UserProfile } from '@repo/schemas'
import type { UserSession } from '@thallesp/nestjs-better-auth'

export const userMock: UserProfile = {
	id: 'user-id',
	name: 'John Doe',
	email: 'john.doe@example.com',
	emailVerified: true,
	image: 'https://example.com/avatar.jpg',
	createdAt: new Date(),
	updatedAt: new Date()
}

export const mockUserSession = {
	user: { id: 'user-123', name: 'Test User', email: 'test@example.com' }
} as UserSession
