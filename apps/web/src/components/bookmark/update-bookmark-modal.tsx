import { zodResolver } from '@hookform/resolvers/zod'
import { type UpdateBookmark, updateBookmarkSchema } from '@repo/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { BookmarkForm } from '@/components/bookmark/bookmark-form'
import { ModalWrapper } from '@/components/bookmark/modal-wrapper'
import { useBookmarkMetadata } from '@/hooks/useBookmarkMetadata'
import { useUpdateBookmarkModal } from '@/hooks/useBookmarkModal'
import { useBookmarkTags } from '@/hooks/useBookmarkTags'
import { useDebounce } from '@/hooks/useDebounce'
import { useFileSelect } from '@/hooks/useFileSelect'
import { useFileUploadMutation } from '@/hooks/useFileUploadMutation'
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
	const url = useWatch({ control: form.control, name: 'url' }) || ''
	const debouncedUrl = useDebounce(url, 500)
	const lastFetchedMetadataUrlRef = useRef<string | null>(null)
	const initialBookmarkUrlRef = useRef<string | null>(null)

	const { tags, setTags, resetTags } = useBookmarkTags()

	const {
		selectedFile,
		clearSelection,
		handleFileSelect,
		setPreview,
		preview
	} = useFileSelect()

	const { data, isLoading } = useBookmarkMetadata({
		url: debouncedUrl,
		initialBookmarkUrlRef,
		enabled: isOpen || !!bookmark
	})

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

	const { mutateAsync: mutateFileUpload } = useFileUploadMutation()

	const onSubmit = async (data: UpdateBookmark) => {
		if (selectedFile) {
			const uploadPromise = mutateFileUpload(selectedFile)

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
		initialBookmarkUrlRef.current = bookmark.url
		lastFetchedMetadataUrlRef.current = null
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

	useEffect(() => {
		if (debouncedUrl.trim() === initialBookmarkUrlRef.current || !data) return

		form.setValue('title', data.title, { shouldDirty: false })
		form.setValue('description', data.description, { shouldDirty: false })

		if (data?.favicon) {
			handleFileSelect(data.favicon)
		}
	}, [debouncedUrl, data, handleFileSelect, form.setValue])

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
					isFetchingMetadata={isLoading}
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
