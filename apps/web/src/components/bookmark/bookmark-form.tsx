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
	submitButtonTitle?: string
}

export const BookmarkForm = ({
	onSubmit,
	handleFileSelect,
	clearSelection,
	preview,
	isPending,
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

			<BookmarkFormInputs />

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

				<SubmitButton
					type="submit"
					title={submitButtonTitle}
					className="w-36.25"
					disabled={isPending}
				/>
			</DialogFooter>
		</form>
	)
}
