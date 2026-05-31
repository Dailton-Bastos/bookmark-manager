import { createContext, useContext } from 'react'

interface BookmarkTagsContextValue {
	tags: string[]
	addTag: (tag: string) => void
	removeTag: (tag: string) => void
	resetTags: () => void
	setTags: (tags: string[]) => void
}

export const BookmarkTagsContext =
	createContext<BookmarkTagsContextValue | null>(null)

export const useBookmarkTags = () => {
	const context = useContext(BookmarkTagsContext)

	if (!context) {
		throw new Error(
			'useBookmarkTags must be used within a BookmarkTagsProvider'
		)
	}

	return context
}
