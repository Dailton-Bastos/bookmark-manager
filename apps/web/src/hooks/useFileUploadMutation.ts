'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpcClient } from '@/lib/orpc-client'

export const useFileUploadMutation = () => {
	const { upload } = orpcClient

	const { mutateAsync, isPending, isError, data } = useMutation(
		upload.image.mutationOptions({
			onError: () => {
				toast.error('Failed to upload image. Please try again.')
			}
		})
	)

	return { mutateAsync, isPending, isError, data }
}
