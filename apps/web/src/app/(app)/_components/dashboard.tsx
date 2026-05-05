'use client'

import type { Bookmark as BookmarkData } from '@repo/schemas'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useLoadingBar } from 'react-top-loading-bar'
import { AlertError } from 'ui/components/alert-error'
import { LoaderCircle, Plus } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import { SortByDropdown } from '@/components/app/sort-by-dropdown'
import { Bookmark } from '@/components/shared/bookmark'
import { CardsSkeleton } from '@/components/shared/cards-skeleton'
import { PrimaryButton as AddBookmarkButton } from '@/components/shared/primary-button'
import { useAddBookmarkModal } from '@/hooks/useBookmarkModal'
import { useBookmarks } from '@/hooks/useBookmarks'
import { orpcClient } from '@/lib/orpc-client'

export const Dashboard = () => {
	const { onOpen } = useAddBookmarkModal()
	const { start, complete } = useLoadingBar()

	const { limit, order, setOrder } = useBookmarks()

	const { ref, inView } = useInView()

	const {
		data,
		error,
		isFetching,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		refetch,
		isPending
	} = useInfiniteQuery(
		orpcClient.bookmark.list.infiniteOptions({
			input: (pageParam: number | undefined) => ({
				limit,
				order,
				page: pageParam ?? 1
			}),
			initialPageParam: 1,
			getNextPageParam: ({ meta }) =>
				meta.hasNextPage ? meta.currentPage + 1 : undefined
		})
	)

	const bookmarks =
		data?.pages.flatMap((page) => {
			return page.data.map((bookmark) => ({
				...bookmark,
				createdAt: new Date(bookmark.createdAt),
				updatedAt: new Date(bookmark.updatedAt),
				lastVisited: bookmark.lastVisited
					? new Date(bookmark.lastVisited)
					: null
			}))
		}) ?? []

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	useEffect(() => {
		if (isPending) {
			start()

			return
		}

		complete()

		return () => complete()
	}, [isPending, start, complete])

	if (error) {
		return (
			<section className="flex items-center justify-center w-full p-4">
				<AlertError
					title="Oops! Something went wrong"
					description="There was a problem fetching your bookmarks. Please try again."
					showDismissButton={false}
					onRetry={() => refetch()}
				/>
			</section>
		)
	}

	if (!isPending && bookmarks.length === 0) {
		return (
			<section className="flex flex-col pt-28 items-center justify-center gap-4 w-full p-4">
				<p className="text-muted-foreground font-medium text-sm">
					No bookmarks found. Start by adding your first bookmark!
				</p>

				<AddBookmarkButton
					type="button"
					title="Add Bookmark"
					icon={Plus}
					onClick={onOpen}
					className="w-full sm:w-auto"
				/>
			</section>
		)
	}

	return (
		<div className="w-full p-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h1 className="text-2xl font-bold text-foreground">All bookmarks</h1>
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
							{!isPending &&
								bookmarks.map((bookmark: BookmarkData) => (
									<Bookmark key={bookmark.id} {...bookmark} />
								))}

							{(isFetchingNextPage || isPending) && <CardsSkeleton />}
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
