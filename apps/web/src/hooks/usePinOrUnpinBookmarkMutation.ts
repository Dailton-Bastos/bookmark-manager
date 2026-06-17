'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpcClient } from '@/lib/orpc-client'

export const usePinOrUnpinBookmarkMutation = () => {
	const queryClient = useQueryClient()

	const pinOrUnpinBookmarkMutation = useMutation(
		orpcClient.bookmark.pinOrUnpin.mutationOptions({
			onSuccess: async () => {
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: orpcClient.bookmark.list.key()
					}),

					queryClient.invalidateQueries({
						queryKey: orpcClient.bookmark.search.key()
					})
				])
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
				loading: `${pinned ? 'Unpinning' : 'Pinning'} bookmark...`,
				success: `Bookmark ${pinned ? 'unpinned' : 'pinned'} successfully!`,
				error: (err) => {
					if (err instanceof Error) return err.message

					return `An error occurred while ${
						pinned ? 'unpinning' : 'pinning'
					} the bookmark.`
				}
			}
		)
	}

	return { pinOrUnpinBookmarkMutation, handlePinUnpinBookmark }
}
