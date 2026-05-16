'use client'

import {
	useInfiniteQuery,
	useMutation,
	useQueryClient
} from '@tanstack/react-query'
import React, { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import { useLoadingBar } from 'react-top-loading-bar'
import { toast } from 'sonner'
import { LoaderCircle, Plus } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import { SortByDropdown } from '@/components/app/sort-by-dropdown'
import { ArchiveUnarchiveBookmarkModal } from '@/components/bookmark/archive-unarchive-bookmark-modal'
import { Bookmark } from '@/components/shared/bookmark'
import { CardsSkeleton } from '@/components/shared/cards-skeleton'
import { PrimaryButton as AddBookmarkButton } from '@/components/shared/primary-button'
import {
	useAddBookmarkModal,
	useArchiveUnarchiveBookmarkModal
} from '@/hooks/useBookmarkModal'
import { useBookmarks } from '@/hooks/useBookmarks'
import { orpcClient } from '@/lib/orpc-client'

export const Dashboard = () => {
	const { onOpen } = useAddBookmarkModal()
	const { start, complete } = useLoadingBar()

	const { limit, order, setOrder } = useBookmarks()
	const { bookmarkId, onClose, type } = useArchiveUnarchiveBookmarkModal()

	const { ref, inView } = useInView()

	const queryClient = useQueryClient()

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
				archived: 'exclude'
			}),
			initialPageParam: 1,
			getNextPageParam: ({ meta }) =>
				meta.hasNextPage ? meta.currentPage + 1 : undefined
		})
	)

	const bookmarks = useMemo(() => {
		if (!data) return []

		return data.pages.map((page) => {
			return {
				...page,
				data: page.data
					.map((bookmark) => ({
						...bookmark,
						createdAt: new Date(bookmark.createdAt),
						updatedAt: new Date(bookmark.updatedAt),
						lastVisited: bookmark.lastVisited
							? new Date(bookmark.lastVisited)
							: null
					}))
					.sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1)) // Sort pinned bookmarks first
			}
		})
	}, [data])

	const archiveBookmarkMutation = useMutation(
		orpcClient.bookmark.archiveOrUnarchive.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpcClient.bookmark.list.key()
				})

				onClose()
			}
		})
	)

	const handleArchiveBookmark = async () => {
		if (bookmarkId === null) {
			toast.error('No bookmark selected for archiving.')

			onClose()

			return
		}

		toast.promise(
			archiveBookmarkMutation.mutateAsync({
				id: bookmarkId,
				isArchived: type === 'archive'
			}),
			{
				loading: 'Archiving bookmark...',
				success: 'Bookmark archived successfully!',
				error: (err) => {
					if (err instanceof Error) return err.message

					return 'An error occurred while archiving the bookmark.'
				}
			}
		)
	}

	const pinOrUnpinBookmarkMutation = useMutation(
		orpcClient.bookmark.pinOrUnpin.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpcClient.bookmark.list.key()
				})
			}
		})
	)

	const handlePinUnpinBookmark = async (
		bookmarkId: number,
		pinned: boolean
	) => {
		toast.promise(
			pinOrUnpinBookmarkMutation.mutateAsync({
				id: bookmarkId,
				pinned: !pinned
			}),
			{
				error: (err) => {
					if (err instanceof Error) return err.message

					return `An error occurred while ${
						pinned ? 'unpinning' : 'pinning'
					} the bookmark.`
				}
			}
		)
	}

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

	useEffect(() => {
		if (error) {
			toast.error(
				'There was a problem fetching your bookmarks. Please try again.'
			)
		}
	}, [error])

	if (!isPending && error && !data) {
		return (
			<section className="flex flex-col pt-28 items-center justify-center gap-4 w-full p-4">
				<p className="text-muted-foreground font-medium text-sm">
					There was a problem fetching your bookmarks. Please try again.
				</p>
			</section>
		)
	}

	if (!isPending && bookmarks[0]?.data.length === 0) {
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
							{bookmarks.map((page) => (
								<React.Fragment key={page.meta.currentPage}>
									{page.data.map((bookmark) => (
										<Bookmark
											key={bookmark.id}
											bookmark={bookmark}
											handlePinUnpinBookmark={handlePinUnpinBookmark}
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

			<ArchiveUnarchiveBookmarkModal
				isPending={archiveBookmarkMutation.isPending}
				handleArchiveUnarchive={handleArchiveBookmark}
			/>
		</div>
	)
}
