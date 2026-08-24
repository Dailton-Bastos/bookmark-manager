import { Button } from 'ui/components/shadcn/ui/button'
import { DialogClose, DialogFooter } from 'ui/components/shadcn/ui/dialog'
import { BookmarkFormInputs } from '@/components/bookmark/bookmark-form-inputs'
import { PrimaryButton as SubmitButton } from '@/components/shared/primary-button'
import { ImageUpload } from '../shared/image-upload'

interface BookmarkFormProps {
	onSubmit: () => void
	handleFileSelect: (file: File) => void
	clearSelection: () => void
	preview: string | null
	isPending: boolean
	isFetchingMetadata: boolean
	submitButtonTitle?: string
}

export const BookmarkForm = ({
	onSubmit,
	handleFileSelect,
	clearSelection,
	preview,
	isPending,
	isFetchingMetadata,
	submitButtonTitle = 'Save Bookmark'
}: BookmarkFormProps) => {
	return (
		<form id="bookmark-form" onSubmit={onSubmit}>
			<div className="flex items-center justify-center w-full p-2">
				<ImageUpload
					onFileSelected={handleFileSelect}
					clearSelection={clearSelection}
					preview={preview}
				/>
			</div>

			<BookmarkFormInputs isFetchingMetadata={isFetchingMetadata} />

			<DialogFooter className="gap-4 mt-4 md:mt-8 flex-row justify-between lg:justify-end">
				<DialogClose asChild>
					<Button
						variant="ghost"
						disabled={isPending || isFetchingMetadata}
						className="h-10 md:h-11.5 min-w-auto flex-1 md:flex-none md:min-w-22.5 w-full md:w-fit rounded-lg border cursor-pointer font-semibold text-base text-foreground hover:bg-secondary"
					>
						Cancel
					</Button>
				</DialogClose>

				<SubmitButton
					type="submit"
					title={submitButtonTitle}
					className="w-full flex-1 md:flex-none h-10 md:h-11.5 md:w-36.25"
					disabled={isPending || isFetchingMetadata}
				/>
			</DialogFooter>
		</form>
	)
}
