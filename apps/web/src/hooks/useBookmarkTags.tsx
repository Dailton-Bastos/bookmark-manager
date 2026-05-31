import { createContext, useContext, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { MAX_BOOKMARK_TAGS } from '@/utils/constants'

interface BookmarkTagsContextValue {
	tags: string[]
	addTag: (tag: string) => void
	removeTag: (tag: string) => void
	resetTags: () => void
	setTags: (tags: string[]) => void
}

const BookmarkTagsContext = createContext<BookmarkTagsContextValue | null>(null)

export const BookmarkTagsProvider = ({ children }: { children: ReactNode }) => {
	const [tags, setTagsState] = useState<string[]>([])

	const addTag = (tag: string) => {
		setTagsState((prev) => {
			if (prev.length >= MAX_BOOKMARK_TAGS) {
				toast.error(`You can only add up to ${MAX_BOOKMARK_TAGS} tags.`)
				return prev
			}

			if (prev.includes(tag)) {
				toast.error('This tag has already been added.')
				return prev
			}

			if (tag.trim().length > 50) {
				toast.error('Tag name cannot be longer than 50 characters.')
				return prev
			}

			return [...prev, tag]
		})
	}

	const removeTag = (tag: string) => {
		setTagsState((prev) => prev.filter((t) => t !== tag))
	}

	const resetTags = () => setTagsState([])

	const setTags = (newTags: string[]) =>
		setTagsState(newTags.slice(0, MAX_BOOKMARK_TAGS))

	return (
		<BookmarkTagsContext.Provider
			value={{ tags, addTag, removeTag, resetTags, setTags }}
		>
			{children}
		</BookmarkTagsContext.Provider>
	)
}

export const useBookmarkTags = () => {
	const context = useContext(BookmarkTagsContext)

	if (!context) {
		throw new Error('useBookmarkTags must be used within a BookmarkTagsProvider')
	}

	return context
}
