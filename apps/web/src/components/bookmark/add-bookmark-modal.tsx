import { zodResolver } from '@hookform/resolvers/zod'
import { type CreateBookmark, createBookmarkSchema } from '@repo/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { BookmarkForm } from '@/components/bookmark/bookmark-form'
import { ModalWrapper } from '@/components/bookmark/modal-wrapper'
import { useAddBookmarkModal } from '@/hooks/useBookmarkModal'
import { useBookmarkTags } from '@/hooks/useBookmarkTags'
import { useFileSelect } from '@/hooks/useFileSelect'
import { orpcClient } from '@/lib/orpc-client'
import { BookmarkTagsProvider } from '@/providers/bookmark-tags-provider'
import { normalizeFormData } from '@/utils/normalize-form-data'

const AddBookmarkModalContent = () => {
	const { isOpen, onClose } = useAddBookmarkModal()

	const queryClient = useQueryClient()

	const { tags, resetTags } = useBookmarkTags()

	const { selectedFile, clearSelection, handleFileSelect, preview } =
		useFileSelect()

	const form = useForm<CreateBookmark>({
		resolver: zodResolver(createBookmarkSchema),
		defaultValues: {
			url: '',
			title: '',
			tags: []
		}
	})

	const { mutateAsync, isPending } = useMutation(
		orpcClient.bookmark.create.mutationOptions({
			onSuccess: async () => {
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: orpcClient.bookmark.list.key()
					}),

					queryClient.invalidateQueries({
						queryKey: orpcClient.tag.list.key()
					}),

					queryClient.invalidateQueries({
						queryKey: orpcClient.bookmark.tagged.key()
					})
				])
				form.reset()
				resetTags()
				clearSelection()
				onClose()
			}
		})
	)

	const mutateFileUpload = useMutation(
		orpcClient.upload.image.mutationOptions({
			onError: () => {
				toast.error('Failed to upload image. Please try again.')
			}
		})
	)

	const onSubmit = async (data: CreateBookmark) => {
		if (selectedFile) {
			const uploadPromise = mutateFileUpload.mutateAsync(selectedFile)

			toast.promise(uploadPromise, {
				loading: 'Uploading image...',
				error: (err) => {
					if (err instanceof Error) return err.message

					return 'An error occurred while uploading the image. Please try again.'
				}
			})

			const { url } = await uploadPromise

			data.favicon = url
		}

		const normalizedData = normalizeFormData<CreateBookmark>({
			...data,
			tags
		})

		toast.promise(mutateAsync(normalizedData), {
			loading: 'Saving bookmark...',
			success: 'Bookmark added successfully!',
			error: (err) => {
				if (err instanceof Error) return err.message

				return 'An error occurred while adding the bookmark.'
			}
		})
	}

	const handleClose = useCallback(() => {
		form.reset()
		clearSelection()
		resetTags()
		onClose()
	}, [form, resetTags, onClose, clearSelection])

	return (
		<ModalWrapper
			isOpen={isOpen}
			onClose={handleClose}
			title="Add a Bookmark"
			description="Save a link with details to keep your collection organized. We extract the favicon automatically from the URL."
		>
			<FormProvider {...form}>
				<BookmarkForm
					onSubmit={form.handleSubmit(onSubmit)}
					handleFileSelect={handleFileSelect}
					clearSelection={clearSelection}
					preview={preview}
					isPending={isPending}
					submitButtonTitle="Add Bookmark"
				/>
			</FormProvider>
		</ModalWrapper>
	)
}

export const AddBookmarkModal = () => {
	return (
		<BookmarkTagsProvider>
			<AddBookmarkModalContent />
		</BookmarkTagsProvider>
	)
}
