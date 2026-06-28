import type { Tag } from '@repo/schemas'

export const mockTag: Tag = {
	id: 1,
	name: 'Test Tag'
}

export const tagWithBookmarkCount = {
	...mockTag,
	bookmarkCount: 5
}
