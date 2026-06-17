'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useArchiveUnarchiveBookmarkModal } from '@/hooks/useBookmarkModal'
import { orpcClient } from '@/lib/orpc-client'

export const useArchiveOrUnarchiveBookmarkMutation = () => {
	const queryClient = useQueryClient()

	const { bookmarkId, onClose, type } = useArchiveUnarchiveBookmarkModal()

	const archiveOrUnarchiveBookmarkMutation = useMutation(
		orpcClient.bookmark.archiveOrUnarchive.mutationOptions({
			onSuccess: async () => {
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: orpcClient.bookmark.list.key()
					}),

					queryClient.invalidateQueries({
						queryKey: orpcClient.bookmark.search.key()
					})
				])

				onClose()
			}
		})
	)

	const handleArchiveOrUnarchiveBookmark = async () => {
		if (bookmarkId === null) {
			toast.error(
				`No bookmark selected for ${type === 'archive' ? 'archiving' : 'unarchiving'}.`
			)

			onClose()

			return
		}

		toast.promise(
			archiveOrUnarchiveBookmarkMutation.mutateAsync({
				id: bookmarkId,
				isArchived: type === 'archive'
			}),
			{
				loading: `${type === 'archive' ? 'Archiving' : 'Unarchiving'} bookmark...`,
				success: `${type === 'archive' ? 'Bookmark archived' : 'Bookmark unarchived'} successfully!`,
				error: (err) => {
					if (err instanceof Error) return err.message

					return `An error occurred while ${type === 'archive' ? 'archiving' : 'unarchiving'} the bookmark.`
				}
			}
		)
	}

	return {
		handleArchiveOrUnarchiveBookmark,
		archiveOrUnarchiveBookmarkMutation
	}
}
