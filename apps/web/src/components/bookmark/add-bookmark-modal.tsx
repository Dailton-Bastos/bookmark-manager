import { zodResolver } from '@hookform/resolvers/zod'
import { type CreateBookmark, createBookmarkSchema } from '@repo/schemas'
import { useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { X } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from 'ui/components/shadcn/ui/dialog'
import { useAddBookmarkModal } from '@/hooks/useBookmarkModal'
import { orpcClient } from '@/lib/orpc-client'
import { normalizeFormData } from '@/utils/normalize-form-data'
import { PrimaryButton as AddBookmarkButton } from '../shared/primary-button'
import { AddBookmarkForm } from './add-bookmark-form'

export const AddBookmarkModal = () => {
	const { isOpen, onClose } = useAddBookmarkModal()

	const form = useForm<CreateBookmark>({
		resolver: zodResolver(createBookmarkSchema),
		defaultValues: {
			url: '',
			title: ''
		}
	})

	const { mutateAsync, isPending } = useMutation(
		orpcClient.bookmark.create.mutationOptions({
			onSuccess: () => {
				form.reset()
				onClose()
			}
		})
	)

	const onSubmit = async (data: CreateBookmark) => {
		const normalizedData = normalizeFormData<CreateBookmark>(data)

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
		onClose()
	}, [form, onClose])

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent
				showCloseButton={false}
				className="bg-card rounded-2xl p-8"
			>
				<DialogHeader>
					<DialogTitle className="font-bold text-2xl text-foreground">
						Add a Bookmark
					</DialogTitle>
					<DialogDescription className="font-medium text-sm text-muted-foreground">
						Save a link with details to keep your collection organized. We
						extract the favicon automatically from the URL.
					</DialogDescription>
					<DialogClose asChild>
						<Button
							aria-label="Close"
							variant="ghost"
							className="absolute top-4 right-4 rounded-lg border h-8 w-8 p-0 cursor-pointer hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
						>
							<X className="h-4 w-4 text-foreground" />
						</Button>
					</DialogClose>
				</DialogHeader>

				<FormProvider {...form}>
					<form id="add-bookmark-form" onSubmit={form.handleSubmit(onSubmit)}>
						<AddBookmarkForm />

						<DialogFooter className="gap-4 mt-8">
							<DialogClose asChild>
								<Button
									variant="ghost"
									disabled={isPending}
									className="h-11.5 min-w-22.5 rounded-lg border cursor-pointer font-semibold text-base text-foreground hover:bg-secondary"
								>
									Cancel
								</Button>
							</DialogClose>

							<AddBookmarkButton
								type="submit"
								title="Add Bookmark"
								className="w-36.25"
								disabled={isPending}
							/>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	)
}
