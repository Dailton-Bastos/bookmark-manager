'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpcClient } from '@/lib/orpc-client'

export const useVisitedBookmarkMutation = () => {
	const queryClient = useQueryClient()

	const visitedBookmarkMutation = useMutation(
		orpcClient.bookmark.visited.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpcClient.bookmark.list.key()
				})
			}
		})
	)

	const handleVisitedBookmark = async (bookmarkId: number) => {
		try {
			await visitedBookmarkMutation.mutateAsync({ id: bookmarkId })
		} catch (err) {
			if (err instanceof Error) {
				toast.error(err.message)
			} else {
				toast.error('An error occurred while updating the bookmark.')
			}
		}
	}

	return { visitedBookmarkMutation, handleVisitedBookmark }
}
