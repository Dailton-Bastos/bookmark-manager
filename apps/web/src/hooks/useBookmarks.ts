'use client'

import type { ListBookmarksOrder } from '@repo/schemas'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useLoadingBar } from 'react-top-loading-bar'
import { toast } from 'sonner'
import { create } from 'zustand'
import { orpcClient } from '@/lib/orpc-client'
import { formatBookmark } from '@/utils/format-bookmark'

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

interface UseTaggedBookmarksInfiniteQueryParams {
	tags: number[]
	order: ListBookmarksOrder
}

interface TaggedBookmarksStore {
	tags: number[]
	order: ListBookmarksOrder
	setTags: (tags: number[]) => void
	addTag: (tag: number) => void
	removeTag: (tag: number) => void
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
				data: page.data.map((bookmark) => formatBookmark(bookmark))
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
				data: page.data.map((bookmark) => formatBookmark(bookmark))
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

export const useTagBookmarksStore = create<TaggedBookmarksStore>((set) => ({
	tags: [],
	order: 'desc',
	addTag: (tag: number) =>
		set((state) =>
			state.tags.includes(tag) ? state : { tags: [...state.tags, tag] }
		),
	removeTag: (tag: number) =>
		set((state) => ({ tags: state.tags.filter((t) => t !== tag) })),
	setTags: (tags: number[]) => set({ tags: Array.from(new Set(tags)) }),
	setOrder: (order: ListBookmarksOrder) => set({ order })
}))

export const useTaggedBookmarksInfiniteQuery = ({
	tags,
	order
}: UseTaggedBookmarksInfiniteQueryParams) => {
	const { start, complete } = useLoadingBar()

	const isTagsValid = tags.length > 0

	const {
		data,
		error,
		isFetching,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isPending
	} = useInfiniteQuery(
		orpcClient.bookmark.tagged.infiniteOptions({
			input: (pageParam: number | undefined) => ({
				tags,
				order,
				page: pageParam ?? 1,
				limit: 12
			}),
			initialPageParam: 1,
			getNextPageParam: ({ meta }) =>
				meta.hasNextPage ? meta.currentPage + 1 : undefined,
			enabled: isTagsValid
		})
	)

	const result = useMemo(() => {
		if (!data) return undefined

		return data.pages.map((page) => {
			return {
				...page,
				data: page.data.map((bookmark) => formatBookmark(bookmark))
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
				'There was a problem fetching your tagged bookmarks. Please try again.'
			)
		}
	}, [error])

	return {
		result,
		error,
		isFetching,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isPending
	}
}
