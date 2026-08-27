import type { Bookmark } from '@repo/schemas'
import { getImageUrl } from './get-image-url'

type BookmarkData = Omit<
	Bookmark,
	'createdAt' | 'updatedAt' | 'lastVisited' | 'archivedAt'
> & {
	createdAt: string
	updatedAt: string
	lastVisited: string | null
	archivedAt: string | null
}

export const formatBookmark = (bookmark: BookmarkData): Bookmark => {
	return {
		...bookmark,
		favicon: bookmark.favicon ? getImageUrl(bookmark.favicon) : null,
		createdAt: new Date(bookmark.createdAt),
		updatedAt: new Date(bookmark.updatedAt),
		lastVisited: bookmark.lastVisited ? new Date(bookmark.lastVisited) : null,
		archivedAt: bookmark.archivedAt ? new Date(bookmark.archivedAt) : null
	}
}
