import { X } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from 'ui/components/shadcn/ui/dialog'

interface ModalWrapperProps {
	children: React.ReactNode
	isOpen: boolean
	onClose: () => void
	title: string
	description: string
}

export const ModalWrapper = ({
	children,
	isOpen,
	onClose,
	title,
	description
}: ModalWrapperProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				showCloseButton={false}
				className="bg-card rounded-2xl p-8"
			>
				<DialogHeader>
					<DialogTitle className="font-bold text-2xl text-foreground">
						{title}
					</DialogTitle>
					<DialogDescription className="font-medium text-sm text-muted-foreground">
						{description}
					</DialogDescription>
					<DialogClose asChild>
						<Button
							aria-label="Close"
							variant="ghost"
							className="absolute top-4 right-4 rounded-lg border h-8 w-8 p-0 cursor-pointer hover:bg-secondary disabled:pointer-events-none"
						>
							<X className="h-4 w-4 text-foreground" />
						</Button>
					</DialogClose>
				</DialogHeader>

				{children}
			</DialogContent>
		</Dialog>
	)
}
