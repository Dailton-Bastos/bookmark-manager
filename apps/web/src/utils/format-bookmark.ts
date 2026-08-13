import type { Bookmark } from '@repo/schemas'
import { getImageUrl } from './get-image-url'
import { isValidWebUrl } from './is-valid-web-url'

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
		favicon: bookmark.favicon
			? getImageUrl(bookmark.favicon)
			: isValidWebUrl(bookmark.url)
				? `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=64`
				: null,
		createdAt: new Date(bookmark.createdAt),
		updatedAt: new Date(bookmark.updatedAt),
		lastVisited: bookmark.lastVisited ? new Date(bookmark.lastVisited) : null,
		archivedAt: bookmark.archivedAt ? new Date(bookmark.archivedAt) : null
	}
}
