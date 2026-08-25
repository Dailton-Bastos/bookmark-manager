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
import { useDeleteBookmarkModal } from '@/hooks/useBookmarkModal'
import { useDeleteBookmarkMutation } from '@/hooks/useDeleteBookmarkMutation'

export const DeleteBookmarkModal = () => {
	const { isOpen, onClose } = useDeleteBookmarkModal()

	const { handleDeleteBookmark, deleteBookmarkMutation } =
		useDeleteBookmarkMutation()

	const { isPending } = deleteBookmarkMutation

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				showCloseButton={false}
				className="bg-card rounded-2xl p-4 lg:p-6 gap-0 max-w-85 md:max-w-112.5 w-full"
			>
				<DialogHeader className="text-left">
					<DialogTitle className="font-bold text-2xl text-foreground">
						Delete bookmark
					</DialogTitle>
					<DialogDescription className="font-medium text-sm text-muted-foreground">
						Are you sure you want to delete this bookmark?
					</DialogDescription>
					<DialogClose asChild>
						<Button
							aria-label="Close"
							variant="ghost"
							className="absolute top-4 right-4 h-5 w-5 p-0 cursor-pointer hover:bg-secondary focus:outline-none disabled:pointer-events-none"
						>
							<X className="h-4 w-4 text-foreground" />
						</Button>
					</DialogClose>
				</DialogHeader>

				<DialogFooter className="gap-4 mt-6 flex-row justify-end">
					<DialogClose asChild>
						<Button
							variant="ghost"
							disabled={isPending}
							className="h-11.5 min-w-22.5 rounded-lg border cursor-pointer font-semibold text-base text-foreground hover:bg-secondary"
						>
							Cancel
						</Button>
					</DialogClose>

					<Button
						type="button"
						variant="destructive"
						className="w-fit h-11.5 min-w-22.5 rounded-lg border cursor-pointer font-semibold text-base"
						disabled={isPending}
						onClick={handleDeleteBookmark}
					>
						Delete permanently
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
