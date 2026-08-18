import type { UpdateUserProfileInput } from '@repo/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { orpcClient } from '@/lib/orpc-client'

type UseProfileMutationParams = {
	clearSelection: () => void
	selectedFile: File | null
	preview: string | null
	mutateFileUpload: (file: File) => Promise<{ url: string }>
}

export const useProfileMutation = ({
	clearSelection,
	selectedFile,
	mutateFileUpload,
	preview
}: UseProfileMutationParams) => {
	const queryClient = useQueryClient()

	const { mutateAsync, isPending } = useMutation(
		orpcClient.user.updateProfile.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: orpcClient.user.getProfile.key()
				})
				clearSelection()
			}
		})
	)

	const handleUpdateProfile = useCallback(
		async (data: UpdateUserProfileInput) => {
			if (selectedFile) {
				const uploadPromise = mutateFileUpload(selectedFile)

				toast.promise(uploadPromise, {
					loading: 'Uploading picture...',
					error: (err) => {
						if (err instanceof Error) return err.message

						return 'An error occurred while uploading the image. Please try again.'
					}
				})

				const { url } = await uploadPromise

				data.image = url
			}

			if (!selectedFile && !preview) {
				data.image = null
			}

			toast.promise(mutateAsync(data), {
				loading: 'Saving profile...',
				success: 'Profile updated successfully!',
				error: (err) => {
					if (err instanceof Error) return err.message

					return 'An error occurred while updating the profile.'
				}
			})
		},
		[selectedFile, mutateFileUpload, mutateAsync, preview]
	)

	return {
		handleUpdateProfile,
		isPending
	}
}
