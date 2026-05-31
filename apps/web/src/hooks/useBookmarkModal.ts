import type { Bookmark } from '@repo/schemas'
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

interface DeleteBookmarkModalStore {
	bookmarkId: number | null
	isOpen: boolean
	onOpen: (bookmarkId: number) => void
	onClose: () => void
}

interface UpdateBookmarkModalStore {
	bookmark: Bookmark | null
	isOpen: boolean
	onOpen: (bookmark: Bookmark) => void
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

export const useDeleteBookmarkModal = create<DeleteBookmarkModalStore>(
	(set) => ({
		bookmarkId: null,
		isOpen: false,
		onOpen: (bookmarkId: number) => set({ isOpen: true, bookmarkId }),
		onClose: () => set({ isOpen: false, bookmarkId: null })
	})
)

export const useUpdateBookmarkModal = create<UpdateBookmarkModalStore>(
	(set) => ({
		bookmark: null,
		isOpen: false,
		onOpen: (bookmark: Bookmark) => set({ isOpen: true, bookmark }),
		onClose: () => set({ isOpen: false, bookmark: null })
	})
)
