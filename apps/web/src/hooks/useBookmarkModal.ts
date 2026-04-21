import { create } from 'zustand'

interface BookmarkModalStore {
	isOpen: boolean
	onOpen: () => void
	onClose: () => void
}

export const useAddBookmarkModal = create<BookmarkModalStore>((set) => ({
	isOpen: false,
	onOpen: () => set({ isOpen: true }),
	onClose: () => set({ isOpen: false })
}))
