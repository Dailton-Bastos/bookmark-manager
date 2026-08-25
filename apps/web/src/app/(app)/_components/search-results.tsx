'use client'

import type { ListBookmarksOrder } from '@repo/schemas'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { LoaderCircle } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import { SortByDropdown } from '@/components/app/sort-by-dropdown'
import { Bookmark } from '@/components/shared/bookmark'
import { CardsSkeleton } from '@/components/shared/cards-skeleton'
import {
	useSearchBookmarksInfiniteQuery,
	useSearchBookmarksStore
} from '@/hooks/useBookmarks'
import { usePinOrUnpinBookmarkMutation } from '@/hooks/usePinOrUnpinBookmarkMutation'
import { useVisitedBookmarkMutation } from '@/hooks/useVisitedBookmarkMutation'

interface Props {
	params: {
		search?: string
		order?: ListBookmarksOrder
		page?: number
	}
}

export const SearchResults = ({ params }: Props) => {
	const { handlePinUnpinBookmark } = usePinOrUnpinBookmarkMutation()
	const { handleVisitedBookmark } = useVisitedBookmarkMutation()
	const { query, order, setOrder, setQuery, setSearchTerm } =
		useSearchBookmarksStore()

	const { ref, inView } = useInView()

	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()

	const {
		bookmarks,
		error,
		isFetching,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isPending
	} = useSearchBookmarksInfiniteQuery({ query, order })

	const handleSortOrderChange = (newOrder: ListBookmarksOrder) => {
		// Create a mutable copy of current parameters
		const params = new URLSearchParams(searchParams.toString())

		setOrder(newOrder)

		params.set('order', newOrder)

		// Update the URL string without reloading the page
		router.push(`${pathname}?${params.toString()}`)
	}

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	useEffect(() => {
		if (params.search) {
			setQuery(params.search)
			setSearchTerm(params.search)
		}

		if (params.order) {
			setOrder(params.order)
		}
	}, [params, setOrder, setQuery, setSearchTerm])

	if (!isPending && error && !bookmarks) {
		return (
			<section className="flex flex-col pt-28 items-center justify-center gap-4 w-full p-4">
				<p className="text-muted-foreground font-medium text-sm">
					There was a problem fetching your bookmarks. Please try again.
				</p>
			</section>
		)
	}

	if (!isPending && !error && bookmarks?.[0]?.data.length === 0) {
		return (
			<section className="flex flex-col pt-28 items-center justify-center gap-4 w-full p-4">
				<p className="text-muted-foreground font-medium text-sm">
					No results found
				</p>
			</section>
		)
	}

	return (
		<div className="w-full p-8">
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-baseline gap-2 md:items-center">
					<div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
						<h1 className="text-lg md:text-2xl font-bold text-foreground">
							Results for:
						</h1>
						<span className="text-primary text-base font-normal md:font-bold md:text-lg dark:text-muted-foreground">
							{!isFetching && `"${query}"`}
						</span>
					</div>
					{isFetching && (
						<LoaderCircle className="size-4 text-muted-foreground animate-spin" />
					)}
				</div>
				<SortByDropdown order={order} setOrder={handleSortOrderChange} />
			</div>

			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-5 md:gap-6">
						<div className="grid grid-cols-1 gap-4 md:gap-8 lg:gap-6 *:data-[slot=card]:shadow-md @xl/main:grid-cols-2 @5xl/main:grid-cols-3 @8xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
							{(bookmarks ?? []).map((page) => (
								<React.Fragment key={page.meta.currentPage}>
									{page.data.map((bookmark) => (
										<Bookmark
											key={bookmark.id}
											bookmark={bookmark}
											handlePinUnpinBookmark={handlePinUnpinBookmark}
											handleVisitedBookmark={handleVisitedBookmark}
										/>
									))}
								</React.Fragment>
							))}

							{(isFetchingNextPage || isPending) && (
								<CardsSkeleton length={12} />
							)}
						</div>

						<div className="w-full flex items-center justify-center mt-8">
							<span ref={ref} className="inline-block">
								<Button
									type="button"
									variant="ghost"
									onClick={() => fetchNextPage()}
									disabled={!hasNextPage || isFetchingNextPage}
									className="cursor-pointer"
								>
									{isFetchingNextPage
										? 'Loading more...'
										: hasNextPage
											? 'Load More'
											: 'Nothing more to load'}
								</Button>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
