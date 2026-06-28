import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { orpcClient } from '@/lib/orpc-client'

export const useTagsInfiniteQuery = ({ limit }: { limit: number }) => {
	const {
		data,
		error,
		isFetching,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isPending,
		...result
	} = useInfiniteQuery(
		orpcClient.tag.list.infiniteOptions({
			input: (pageParam = 1) => ({
				limit,
				page: pageParam
			}),
			initialPageParam: 1,
			getNextPageParam: ({ meta }) =>
				meta.hasNextPage ? meta.currentPage + 1 : undefined
		})
	)

	const tags = useMemo(() => {
		if (!data) return []

		return data.pages.flatMap((page) => page.data)
	}, [data])

	useEffect(() => {
		if (error) {
			toast.error('There was a problem fetching your tags. Please try again.')
		}
	}, [error])

	return {
		tags,
		isFetching,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isPending,
		...result
	}
}
