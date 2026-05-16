import { create } from 'zustand'

interface BookmarkModalStore {
	isOpen: boolean
	onOpen: () => void
	onClose: () => void
}

interface ArchiveUnarchiveBookmarkModalStore {
	type: 'archive' | 'unarchive'
	isOpen: boolean
	bookmarkId: number | null
	onOpen: (type: 'archive' | 'unarchive', bookmarkId: number) => void
	onClose: () => void
}

export const useAddBookmarkModal = create<BookmarkModalStore>((set) => ({
	isOpen: false,
	onOpen: () => set({ isOpen: true }),
	onClose: () => set({ isOpen: false })
}))

export const useArchiveUnarchiveBookmarkModal =
	create<ArchiveUnarchiveBookmarkModalStore>((set) => ({
		type: 'archive',
		isOpen: false,
		bookmarkId: null,
		onOpen: (type: 'archive' | 'unarchive', bookmarkId: number) =>
			set({ isOpen: true, type, bookmarkId }),
		onClose: () => set({ isOpen: false, bookmarkId: null })
	}))
