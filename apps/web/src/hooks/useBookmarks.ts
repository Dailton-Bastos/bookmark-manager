import type { ListBookmarksOrder } from '@repo/schemas'
import { create } from 'zustand'

interface BookmarksStore {
	limit: number
	order: ListBookmarksOrder
	setOrder: (order: ListBookmarksOrder) => void
	setLimit: (limit: number) => void
}

export const useBookmarks = create<BookmarksStore>((set) => ({
	order: 'asc',
	limit: 12,
	setOrder: (order) => set({ order }),
	setLimit: (limit) => set({ limit })
}))
