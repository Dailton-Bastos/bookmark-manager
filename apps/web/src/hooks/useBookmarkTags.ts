import { toast } from 'sonner'
import { create } from 'zustand'
import { MAX_BOOKMARK_TAGS } from '@/utils/constants'

interface BookmarkTagsStore {
	tags: string[]
	addTag: (tag: string) => void
	removeTag: (tag: string) => void
	resetTags: () => void
	setTags: (tags: string[]) => void
}

export const useBookmarkTags = create<BookmarkTagsStore>((set) => ({
	tags: [],
	addTag: (tag: string) =>
		set((state) => {
			if (state.tags.length >= MAX_BOOKMARK_TAGS) {
				toast.error(`You can only add up to ${MAX_BOOKMARK_TAGS} tags.`)
				return state
			}

			if (state.tags.includes(tag)) {
				toast.error('This tag has already been added.')
				return state
			}

			if (tag.trim().length > 50) {
				toast.error('Tag name cannot be longer than 50 characters.')
				return state
			}

			return { tags: [...state.tags, tag] }
		}),
	removeTag: (tag: string) =>
		set((state) => ({
			tags: state.tags.filter((t) => t !== tag)
		})),
	resetTags: () => set({ tags: [] }),
	setTags: (tags: string[]) => set({ tags: tags.slice(0, MAX_BOOKMARK_TAGS) })
}))
