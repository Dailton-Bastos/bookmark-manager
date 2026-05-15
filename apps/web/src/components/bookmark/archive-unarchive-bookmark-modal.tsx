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
import { PrimaryButton as ConfirmButton } from '@/components/shared/primary-button'
import { useArchiveUnarchiveBookmarkModal } from '@/hooks/useBookmarkModal'

interface Props {
	isPending: boolean
	handleArchiveUnarchive: () => Promise<void>
}

export const ArchiveUnarchiveBookmarkModal = ({
	isPending,
	handleArchiveUnarchive
}: Props) => {
	const { isOpen, onClose, type } = useArchiveUnarchiveBookmarkModal()

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				showCloseButton={false}
				className="bg-card rounded-2xl p-6 gap-0 sm:max-w-md"
			>
				<DialogHeader>
					<DialogTitle className="font-bold text-2xl text-foreground">
						{type === 'archive' ? 'Archive Bookmark' : 'Unarchive Bookmark'}
					</DialogTitle>
					<DialogDescription className="font-medium text-sm text-muted-foreground">
						{type === 'archive'
							? 'Are you sure you want to archive this bookmark?'
							: 'Are you sure you want to unarchive this bookmark?'}
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

				<DialogFooter className="gap-4 mt-6">
					<DialogClose asChild>
						<Button
							variant="ghost"
							disabled={isPending}
							className="h-11.5 min-w-22.5 rounded-lg border cursor-pointer font-semibold text-base text-foreground hover:bg-secondary"
						>
							Cancel
						</Button>
					</DialogClose>

					<ConfirmButton
						type="submit"
						title={type === 'archive' ? 'Archive' : 'Unarchive'}
						className="w-23.5"
						disabled={isPending}
						onClick={handleArchiveUnarchive}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
