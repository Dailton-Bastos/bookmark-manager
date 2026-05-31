import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BookmarkTagsContext } from '@/hooks/useBookmarkTags'
import { MAX_BOOKMARK_TAGS } from '@/utils/constants'

export const BookmarkTagsProvider = ({ children }: { children: ReactNode }) => {
	const [tags, setTagsState] = useState<string[]>([])

	const addTag = useCallback((tag: string) => {
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
	}, [])

	const removeTag = useCallback((tag: string) => {
		setTagsState((prev) => prev.filter((t) => t !== tag))
	}, [])

	const resetTags = useCallback(() => {
		setTagsState((prev) => (prev.length === 0 ? prev : []))
	}, [])

	const setTags = useCallback((newTags: string[]) => {
		const normalizedTags = newTags.slice(0, MAX_BOOKMARK_TAGS)

		setTagsState((prev) => {
			if (
				prev.length === normalizedTags.length &&
				prev.every((tag, index) => tag === normalizedTags[index])
			) {
				return prev
			}

			return normalizedTags
		})
	}, [])

	const contextValue = useMemo(
		() => ({ tags, addTag, removeTag, resetTags, setTags }),
		[tags, addTag, removeTag, resetTags, setTags]
	)

	return (
		<BookmarkTagsContext.Provider value={contextValue}>
			{children}
		</BookmarkTagsContext.Provider>
	)
}
