'use client'

import type {
	Bookmark as BookmarkData,
	ListBookmarksOrder
} from '@repo/schemas'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { Button } from 'ui/components/shadcn/ui/button'
import { SortByDropdown } from '@/components/app/sort-by-dropdown'
import { Bookmark } from '@/components/shared/bookmark'
import { CardsSkeleton } from '@/components/shared/cards-skeleton'
import {
	useTagBookmarksStore,
	useTaggedBookmarksInfiniteQuery
} from '@/hooks/useBookmarks'
import { usePinOrUnpinBookmarkMutation } from '@/hooks/usePinOrUnpinBookmarkMutation'
import { useVisitedBookmarkMutation } from '@/hooks/useVisitedBookmarkMutation'

interface TaggedBookmarksProps {
	params: {
		tags?: number[]
		order?: ListBookmarksOrder
	}
}

export const TaggedBookmarks = ({ params }: TaggedBookmarksProps) => {
	const [bookmarks, setBookmarks] = useState<BookmarkData[]>([])
	const [selectedTags, setSelectedTags] = useState<string[]>([])

	const { handlePinUnpinBookmark } = usePinOrUnpinBookmarkMutation()
	const { handleVisitedBookmark } = useVisitedBookmarkMutation()
	const { tags, order, setOrder, setTags } = useTagBookmarksStore()

	const { ref, inView } = useInView()

	const searchParams = useSearchParams()
	const pathname = usePathname()

	const {
		result,
		error,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isPending
	} = useTaggedBookmarksInfiniteQuery({ tags, order })

	const selectedTagNames =
		selectedTags.length > 5
			? `${selectedTags.slice(0, 5).join(', ')}...`
			: selectedTags.join(', ')

	const handleSortOrderChange = (newOrder: ListBookmarksOrder) => {
		// Create a mutable copy of current parameters
		const params = new URLSearchParams(searchParams.toString())

		setOrder(newOrder)

		params.set('order', newOrder)

		window.history.replaceState(null, '', `${pathname}?${params.toString()}`)
	}

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	useEffect(() => {
		setTags(params.tags ?? [])
		setOrder(params.order ?? 'desc')
	}, [params.tags, params.order, setTags, setOrder])

	useEffect(() => {
		const allTags = bookmarks.flatMap((bookmark) => bookmark.tags)

		const uniqueBookmarkTags = Array.from([
			...new Map(
				allTags
					.map((tag) => tag)
					.filter((tag): tag is { id: number; name: string } => tag !== null)
					.map((tag) => [tag.id, tag])
			).values()
		])

		const filteredSelectedTags = uniqueBookmarkTags.filter((tag) =>
			tags.includes(tag.id)
		)

		setSelectedTags(filteredSelectedTags.map((tag) => tag.name))
	}, [bookmarks, tags])

	useEffect(() => {
		if (!result) return

		setBookmarks(result.flatMap((page) => page.data))
	}, [result])

	if (!tags || tags.length === 0) {
		return (
			<section className="flex flex-col pt-28 items-center justify-center gap-4 w-full p-4">
				<p className="text-muted-foreground font-medium text-sm">
					No tags provided. Please provide at least one tag to filter bookmarks.
				</p>
			</section>
		)
	}

	if (!isPending && error && bookmarks.length === 0) {
		return (
			<section className="flex flex-col pt-28 items-center justify-center gap-4 w-full p-4">
				<p className="text-muted-foreground font-medium text-sm">
					There was a problem fetching your bookmarks. Please try again.
				</p>
			</section>
		)
	}

	if (!isPending && !error && bookmarks.length === 0) {
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
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h1 className="text-2xl font-bold text-foreground">
						Bookmarks tagged:{' '}
						<span className="text-primary">{selectedTagNames}</span>
					</h1>
				</div>
				<div className="ml-auto flex items-center gap-4">
					<SortByDropdown order={order} setOrder={handleSortOrderChange} />
				</div>
			</div>

			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						<div className="grid grid-cols-1 gap-3 *:data-[slot=card]:shadow-md @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
							{bookmarks.map((bookmark) => (
								<Bookmark
									key={bookmark.id}
									bookmark={bookmark}
									handlePinUnpinBookmark={handlePinUnpinBookmark}
									handleVisitedBookmark={handleVisitedBookmark}
								/>
							))}

							{isPending && bookmarks.length === 0 && (
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
