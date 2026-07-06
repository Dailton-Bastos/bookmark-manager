'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useDeleteBookmarkModal } from '@/hooks/useBookmarkModal'
import { orpcClient } from '@/lib/orpc-client'

export const useDeleteBookmarkMutation = () => {
	const queryClient = useQueryClient()

	const { bookmarkId, onClose } = useDeleteBookmarkModal()

	const deleteBookmarkMutation = useMutation(
		orpcClient.bookmark.delete.mutationOptions({
			onSuccess: async () => {
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: orpcClient.bookmark.list.key()
					}),

					queryClient.invalidateQueries({
						queryKey: orpcClient.bookmark.search.key()
					}),

					queryClient.invalidateQueries({
						queryKey: orpcClient.tag.list.key()
					}),

					queryClient.invalidateQueries({
						queryKey: orpcClient.bookmark.tagged.key()
					})
				])

				onClose()
			}
		})
	)

	const handleDeleteBookmark = async () => {
		if (bookmarkId === null) {
			toast.error('No bookmark selected for deletion.')

			onClose()

			return
		}

		toast.promise(
			deleteBookmarkMutation.mutateAsync({
				id: bookmarkId
			}),
			{
				loading: 'Deleting bookmark...',
				success: 'Bookmark deleted successfully!',
				error: (err) => {
					if (err instanceof Error) return err.message

					return 'An error occurred while deleting the bookmark.'
				}
			}
		)
	}

	return {
		handleDeleteBookmark,
		deleteBookmarkMutation
	}
}
