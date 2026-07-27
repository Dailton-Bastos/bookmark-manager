import type { Bookmark } from '@repo/schemas'
import type { UserSession } from '@thallesp/nestjs-better-auth'

export const mockBookmark: Bookmark = {
	id: 1,
	title: 'Test Bookmark',
	description: 'This is a test bookmark.',
	favicon: 'https://example.com/favicon.ico',
	url: 'https://example.com',
	pinned: false,
	isArchived: false,
	visitCount: 0,
	createdAt: new Date(),
	updatedAt: new Date(),
	lastVisited: null,
	archivedAt: null,
	ownerId: 'user-123',
	tags: []
}

export const mockCreateBookmarkInput = {
	title: 'Test Bookmark',
	description: 'This is a test bookmark.',
	url: 'https://example.com'
}

export const mockUserSession = {
	user: { id: 'user-123', name: 'Test User', email: 'test@example.com' }
} as UserSession

export const mockBookmarkWithTags = {
	...mockBookmark,
	tags: [{ id: 1, name: 'Test Tag' }]
}

export const mockBookmarkWithoutTags = {
	...mockBookmark,
	tags: []
}

export const mockMetadataResult = {
	title: 'Example Domain',
	description: 'This domain is for use in illustrative examples in documents.',
	favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=64'
}
