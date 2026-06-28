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
					})
				])
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
