import type { TagWithBookmarkCount } from '@repo/schemas'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { orpcClient } from '@/lib/orpc-client'
import { DEFAULT_TAGS_LIMIT } from '@/utils/constants'

export const useTagsQuery = () => {
	const [tags, setTags] = useState<TagWithBookmarkCount[]>([])
	const [limit, setLimit] = useState(DEFAULT_TAGS_LIMIT)

	const { data, error, ...result } = useQuery(
		orpcClient.tag.list.queryOptions({
			input: { limit, page: 1 }
		})
	)

	const canViewAllTags = data?.meta?.hasNextPage ?? false

	const remainingTagsCount = data?.meta?.totalItems
		? data?.meta?.totalItems - DEFAULT_TAGS_LIMIT
		: 0

	const viewAllTags = useCallback(() => {
		if (!data?.meta.totalItems) return

		if (data?.meta.totalItems > DEFAULT_TAGS_LIMIT) {
			setLimit(data?.meta.totalItems)
		}
	}, [data?.meta.totalItems])

	const viewLessTags = useCallback(() => {
		setLimit(DEFAULT_TAGS_LIMIT)
	}, [])

	useEffect(() => {
		if (!data?.data) return

		setTags(data.data)
	}, [data?.data])

	useEffect(() => {
		if (error) {
			toast.error('There was a problem fetching your tags. Please try again.')
		}
	}, [error])

	return {
		tags,
		viewAllTags,
		viewLessTags,
		canViewAllTags,
		remainingTagsCount,
		...result
	}
}
