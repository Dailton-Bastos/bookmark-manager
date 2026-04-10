'use client'

import {
	Archive,
	Copy,
	EllipsisVertical,
	ExternalLink,
	PinIcon,
	SquarePen
} from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger
} from 'ui/components/shadcn/ui/dropdown-menu'

export const BookmarkDropdown = () => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="icon"
					aria-label="Bookmark options"
					className="cursor-pointer rounded-lg bg-popover border border-accent text-foreground font-semibold text-base hover:bg-secondary"
				>
					<EllipsisVertical className="size-5 text-foreground" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				className="min-w-50 max-w-50 shadow-lg rounded-lg py-1 border border-secondary"
			>
				<DropdownMenuGroup className="font-semibold text-muted-foreground text-sm">
					<DropdownMenuItem
						className="focus:bg-sidebar-accent p-2 mb-1"
						asChild
						onSelect={(e) => e.preventDefault()}
					>
						<a
							href="http://www.example.com"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2"
						>
							<ExternalLink className="text-muted-foreground" />
							Visit
						</a>
					</DropdownMenuItem>

					<DropdownMenuItem className="focus:bg-sidebar-accent p-2 mb-1">
						<Copy className="text-muted-foreground" />
						Copy URL
					</DropdownMenuItem>

					<DropdownMenuItem className="focus:bg-sidebar-accent p-2 mb-1">
						<PinIcon className="text-muted-foreground" />
						Pin
					</DropdownMenuItem>

					<DropdownMenuItem className="focus:bg-sidebar-accent p-2 mb-1">
						<SquarePen className="text-muted-foreground" />
						Edit
					</DropdownMenuItem>

					<DropdownMenuItem className="focus:bg-sidebar-accent p-2 mb-1">
						<Archive className="text-muted-foreground" />
						Archive
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
