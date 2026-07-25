import { zodResolver } from '@hookform/resolvers/zod'
import { type UpdateBookmark, updateBookmarkSchema } from '@repo/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { BookmarkForm } from '@/components/bookmark/bookmark-form'
import { ModalWrapper } from '@/components/bookmark/modal-wrapper'
import { useUpdateBookmarkModal } from '@/hooks/useBookmarkModal'
import { useBookmarkTags } from '@/hooks/useBookmarkTags'
import { useFileSelect } from '@/hooks/useFileSelect'
import { orpcClient } from '@/lib/orpc-client'
import { BookmarkTagsProvider } from '@/providers/bookmark-tags-provider'
import { normalizeFormData } from '@/utils/normalize-form-data'

const UpdateBookmarkModalContent = () => {
	const { isOpen, onClose, bookmark } = useUpdateBookmarkModal()

	const queryClient = useQueryClient()

	const form = useForm<UpdateBookmark>({
		resolver: zodResolver(updateBookmarkSchema)
	})

	const { reset } = form

	const { tags, setTags, resetTags } = useBookmarkTags()

	const {
		selectedFile,
		clearSelection,
		handleFileSelect,
		setPreview,
		preview
	} = useFileSelect()

	const { mutateAsync, isPending } = useMutation(
		orpcClient.bookmark.update.mutationOptions({
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
				form.reset()
				resetTags()
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

	const onSubmit = async (data: UpdateBookmark) => {
		if (selectedFile) {
			const uploadResult = toast.promise(
				mutateFileUpload.mutateAsync(selectedFile),
				{
					loading: 'Uploading image...',
					error: (err) => {
						if (err instanceof Error) return err.message

						return 'An error occurred while uploading the image. Please try again.'
					}
				}
			)

			const { url } = await uploadResult.unwrap()

			data.favicon = url
		}

		if (!selectedFile && !preview) {
			data.favicon = null
		}

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
		clearSelection()
		resetTags()
		onClose()
	}, [form, resetTags, onClose, clearSelection])

	useEffect(() => {
		if (!isOpen || !bookmark) return

		const initialTags = bookmark.tags?.map((tag) => tag.name) || []

		reset({
			id: bookmark.id,
			url: bookmark.url,
			title: bookmark.title,
			description: bookmark.description || '',
			tags: initialTags
		})

		setTags(initialTags)
	}, [
		isOpen,
		bookmark?.id,
		bookmark?.url,
		bookmark?.title,
		bookmark?.description,
		bookmark?.tags,
		bookmark,
		reset,
		setTags
	])

	useEffect(() => {
		if (bookmark?.favicon) {
			setPreview(bookmark.favicon)
		}
	}, [bookmark, setPreview])

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
					handleFileSelect={handleFileSelect}
					clearSelection={clearSelection}
					preview={preview}
					submitButtonTitle="Update Bookmark"
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
