'use client'

import React, { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { LoaderCircle } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import { SortByDropdown } from '@/components/app/sort-by-dropdown'
import { Bookmark } from '@/components/shared/bookmark'
import { CardsSkeleton } from '@/components/shared/cards-skeleton'
import {
	useArchivedBookmarks,
	useBookmarksInfiniteQuery
} from '@/hooks/useBookmarks'
import { usePinOrUnpinBookmarkMutation } from '@/hooks/usePinOrUnpinBookmarkMutation'
import { useVisitedBookmarkMutation } from '@/hooks/useVisitedBookmarkMutation'

export const ArchivedBookmarks = () => {
	const { limit, order, setOrder } = useArchivedBookmarks()
	const { handlePinUnpinBookmark } = usePinOrUnpinBookmarkMutation()
	const { handleVisitedBookmark } = useVisitedBookmarkMutation()

	const { ref, inView } = useInView()

	const {
		bookmarks,
		error,
		isFetching,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isPending
	} = useBookmarksInfiniteQuery({ limit, order, archived: 'only' })

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

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
					No archived bookmarks found.
				</p>
			</section>
		)
	}

	return (
		<div className="w-full p-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h1 className="text-2xl font-bold text-foreground">
						Archived bookmarks
					</h1>
					{isFetching && (
						<LoaderCircle className="size-4 text-muted-foreground animate-spin" />
					)}
				</div>
				<div className="ml-auto flex items-center gap-4">
					<SortByDropdown order={order} setOrder={setOrder} />
				</div>
			</div>

			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						<div className="grid grid-cols-1 gap-3 *:data-[slot=card]:shadow-md @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
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
							<Button
								ref={ref}
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
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
