'use client'

import type { ListBookmarksOrder } from '@repo/schemas'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useLoadingBar } from 'react-top-loading-bar'
import { toast } from 'sonner'
import { create } from 'zustand'
import { orpcClient } from '@/lib/orpc-client'

interface BookmarksStore {
	limit: number
	order: ListBookmarksOrder
	setOrder: (order: ListBookmarksOrder) => void
	setLimit: (limit: number) => void
}

interface UseBookmarksInfiniteQueryParams {
	limit: number
	order: ListBookmarksOrder
	archived?: 'include' | 'exclude' | 'only'
}

interface SearchBookmarksStore {
	searchTerm: string
	setSearchTerm: (searchTerm: string) => void
	query: string
	order: ListBookmarksOrder
	setQuery: (query: string) => void
	setOrder: (order: ListBookmarksOrder) => void
}

export const useBookmarks = create<BookmarksStore>((set) => ({
	order: 'desc',
	limit: 12,
	setOrder: (order) => set({ order }),
	setLimit: (limit) => set({ limit })
}))

export const useArchivedBookmarks = create<BookmarksStore>((set) => ({
	order: 'desc',
	limit: 12,
	setOrder: (order) => set({ order }),
	setLimit: (limit) => set({ limit })
}))

export const useBookmarksInfiniteQuery = ({
	limit,
	order,
	archived = 'exclude'
}: UseBookmarksInfiniteQueryParams) => {
	const { start, complete } = useLoadingBar()

	const {
		data,
		error,
		isFetching,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isPending
	} = useInfiniteQuery(
		orpcClient.bookmark.list.infiniteOptions({
			input: (pageParam: number | undefined) => ({
				limit,
				order,
				page: pageParam ?? 1,
				archived
			}),
			initialPageParam: 1,
			getNextPageParam: ({ meta }) =>
				meta.hasNextPage ? meta.currentPage + 1 : undefined
		})
	)

	const bookmarks = useMemo(() => {
		if (!data) return undefined

		return data.pages.map((page) => {
			return {
				...page,
				data: page.data.map((bookmark) => ({
					...bookmark,
					createdAt: new Date(bookmark.createdAt),
					updatedAt: new Date(bookmark.updatedAt),
					lastVisited: bookmark.lastVisited
						? new Date(bookmark.lastVisited)
						: null,
					archivedAt: bookmark.archivedAt ? new Date(bookmark.archivedAt) : null
				}))
			}
		})
	}, [data])

	useEffect(() => {
		if (isPending) {
			start()

			return
		}

		complete()

		return () => complete()
	}, [isPending, start, complete])

	useEffect(() => {
		if (error) {
			toast.error(
				'There was a problem fetching your bookmarks. Please try again.'
			)
		}
	}, [error])

	return {
		bookmarks,
		error,
		isFetching,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isPending
	}
}

export const useSearchBookmarksStore = create<SearchBookmarksStore>((set) => ({
	searchTerm: '',
	query: '',
	order: 'desc',
	setSearchTerm: (searchTerm) => set({ searchTerm }),
	setQuery: (query) => set({ query }),
	setOrder: (order) => set({ order })
}))

export const useSearchBookmarksInfiniteQuery = ({
	query,
	order
}: {
	query: string
	order: ListBookmarksOrder
}) => {
	const { start, complete } = useLoadingBar()

	const isQueryValid = query.trim().length > 0

	const {
		data,
		error,
		isFetching,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isPending
	} = useInfiniteQuery(
		orpcClient.bookmark.search.infiniteOptions({
			input: (pageParam: number | undefined) => ({
				query,
				order,
				page: pageParam ?? 1,
				limit: 12
			}),
			initialPageParam: 1,
			getNextPageParam: ({ meta }) =>
				meta.hasNextPage ? meta.currentPage + 1 : undefined,
			enabled: isQueryValid
		})
	)

	const bookmarks = useMemo(() => {
		if (!data) return undefined

		return data.pages.map((page) => {
			return {
				...page,
				data: page.data.map((bookmark) => ({
					...bookmark,
					createdAt: new Date(bookmark.createdAt),
					updatedAt: new Date(bookmark.updatedAt),
					lastVisited: bookmark.lastVisited
						? new Date(bookmark.lastVisited)
						: null,
					archivedAt: bookmark.archivedAt ? new Date(bookmark.archivedAt) : null
				}))
			}
		})
	}, [data])

	useEffect(() => {
		if (isPending) {
			start()

			return
		}

		complete()

		return () => complete()
	}, [isPending, start, complete])

	useEffect(() => {
		if (error) {
			toast.error(
				'There was a problem searching your bookmarks. Please try again.'
			)
		}
	}, [error])

	return {
		bookmarks,
		error,
		isFetching,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isPending
	}
}
