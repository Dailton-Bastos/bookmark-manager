import type { TagWithBookmarkCount } from '@repo/schemas'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { orpcClient } from '@/lib/orpc-client'
import { DEFAULT_TAGS_LIMIT, MAX_TAGS_LIMIT } from '@/utils/constants'

export const useTagsQuery = () => {
	const [tags, setTags] = useState<TagWithBookmarkCount[]>([])
	const [limit, setLimit] = useState(DEFAULT_TAGS_LIMIT)

	const { data, error, ...result } = useQuery(
		orpcClient.tag.list.queryOptions({
			input: { limit, page: 1 }
		})
	)

	const canViewAllTags =
		(data?.meta?.hasNextPage ?? false) && limit < MAX_TAGS_LIMIT

	const isExpanded = limit > DEFAULT_TAGS_LIMIT

	const totalItems = data?.meta?.totalItems
		? Math.min(data.meta.totalItems, MAX_TAGS_LIMIT)
		: 0

	const remainingTagsCount = Math.max(0, totalItems - DEFAULT_TAGS_LIMIT)

	const viewAllTags = useCallback(() => {
		if (!data?.meta?.totalItems) return

		if (data?.meta?.totalItems > DEFAULT_TAGS_LIMIT) {
			const newLimit = Math.min(data.meta.totalItems, MAX_TAGS_LIMIT)
			setLimit(newLimit)
		}
	}, [data?.meta?.totalItems])

	const viewLessTags = useCallback(() => {
		setLimit(DEFAULT_TAGS_LIMIT)
	}, [])

	useEffect(() => {
		if (!data?.data) return

		if (data?.meta?.totalItems > MAX_TAGS_LIMIT) {
			setTags(data.data.slice(0, MAX_TAGS_LIMIT))

			return
		}

		setTags(data.data)
	}, [data?.data, data?.meta?.totalItems])

	useEffect(() => {
		if (error) {
			toast.error('There was a problem fetching your tags. Please try again.')
		}

		setLimit(DEFAULT_TAGS_LIMIT)
	}, [error])

	return {
		tags,
		viewAllTags,
		viewLessTags,
		canViewAllTags,
		isExpanded,
		remainingTagsCount,
		...result
	}
}
