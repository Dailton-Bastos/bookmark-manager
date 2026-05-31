import { zodResolver } from '@hookform/resolvers/zod'
import { type UpdateBookmark, updateBookmarkSchema } from '@repo/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { BookmarkForm } from '@/components/bookmark/bookmark-form'
import { ModalWrapper } from '@/components/bookmark/modal-wrapper'
import { useUpdateBookmarkModal } from '@/hooks/useBookmarkModal'
import {
	BookmarkTagsProvider,
	useBookmarkTags
} from '@/hooks/useBookmarkTags'
import { orpcClient } from '@/lib/orpc-client'
import { normalizeFormData } from '@/utils/normalize-form-data'

const UpdateBookmarkModalContent = () => {
	const { isOpen, onClose, bookmark } = useUpdateBookmarkModal()

	const queryClient = useQueryClient()

	const form = useForm({
		resolver: zodResolver(updateBookmarkSchema)
	})

	const { tags, setTags, resetTags } = useBookmarkTags()

	const { mutateAsync, isPending } = useMutation(
		orpcClient.bookmark.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpcClient.bookmark.list.key()
				})
				form.reset()
				resetTags()
				onClose()
			}
		})
	)

	const onSubmit = async (data: UpdateBookmark) => {
		const normalizedData = normalizeFormData<UpdateBookmark>({
			...data,
			tags
		})

		toast.promise(mutateAsync(normalizedData), {
			loading: 'Updating bookmark...',
			success: 'Bookmark updated successfully!',
			error: (err) => {
				if (err instanceof Error) return err.message

				return 'An error occurred while updating the bookmark.'
			}
		})
	}

	const handleClose = useCallback(() => {
		form.reset()
		resetTags()
		onClose()
	}, [form, resetTags, onClose])

	useEffect(() => {
		if (bookmark) {
			form.reset({
				id: bookmark.id,
				url: bookmark.url,
				title: bookmark.title,
				description: bookmark.description || '',
				tags: bookmark.tags?.map((tag) => tag.name) || []
			})
		}
	}, [bookmark, form])

	useEffect(() => {
		if (bookmark) {
			const initialTags = bookmark.tags?.map((tag) => tag.name) || []

			setTags(initialTags)
		}
	}, [setTags, bookmark])

	return (
		<ModalWrapper
			isOpen={isOpen}
			onClose={handleClose}
			title="Edit Bookmark"
			description="Update your saved link details — change the title, description, URL, or tags anytime."
		>
			<FormProvider {...form}>
				<BookmarkForm
					onSubmit={form.handleSubmit(onSubmit)}
					isPending={isPending}
				/>
			</FormProvider>
		</ModalWrapper>
	)
}

export const UpdateBookmarkModal = () => {
	return (
		<BookmarkTagsProvider>
			<UpdateBookmarkModalContent />
		</BookmarkTagsProvider>
	)
}
