'use client'

import type { Bookmark } from '@repo/schemas'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { CustomPinIcon as PinIcon } from 'ui/components/custom-icons/pin'
import {
	Archive,
	Copy,
	EllipsisVertical,
	ExternalLink,
	RotateCcw,
	SquarePen,
	Trash2,
	TriangleAlert
} from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger
} from 'ui/components/shadcn/ui/dropdown-menu'
import {
	useArchiveUnarchiveBookmarkModal,
	useDeleteBookmarkModal,
	useUpdateBookmarkModal
} from '@/hooks/useBookmarkModal'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

interface BookmarkDropdownProps {
	bookmark: Bookmark
	handlePinUnpinBookmark: (bookmarkId: number, pinned: boolean) => Promise<void>
	handleVisitedBookmark: (bookmarkId: number) => Promise<void>
}

export const BookmarkDropdown = ({
	bookmark,
	handlePinUnpinBookmark,
	handleVisitedBookmark
}: BookmarkDropdownProps) => {
	const [copyToClipboard, copyResult] = useCopyToClipboard()

	const { id, url, pinned, isArchived } = bookmark

	const { onOpen: openArchiveUnarchiveModal } =
		useArchiveUnarchiveBookmarkModal()

	const { onOpen: openDeleteBookmarkModal } = useDeleteBookmarkModal()

	const { onOpen: openUpdateBookmarkModal } = useUpdateBookmarkModal()

	useEffect(() => {
		if (copyResult) {
			const { state, message } = copyResult

			if (state === 'success') {
				toast.success('Link copied to clipboard!', {
					icon: <Copy className="size-4 stroke-foreground" />
				})
			}

			if (state === 'error') {
				toast.error(message, {
					icon: <TriangleAlert className="size-4 stroke-foreground" />
				})
			}
		}
	}, [copyResult])

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="icon"
					aria-label="Bookmark options"
					className="w-8 h-8 cursor-pointer rounded-lg bg-popover border border-accent text-foreground font-semibold text-base hover:bg-secondary"
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
						onSelect={() => handleVisitedBookmark(id)}
					>
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2"
						>
							<ExternalLink className="text-muted-foreground" />
							Visit
						</a>
					</DropdownMenuItem>

					<DropdownMenuItem
						className="focus:bg-sidebar-accent p-2 mb-1"
						onSelect={() => copyToClipboard({ text: url })}
					>
						<Copy className="text-muted-foreground" />
						Copy URL
					</DropdownMenuItem>

					{!isArchived && (
						<>
							<DropdownMenuItem
								className="focus:bg-sidebar-accent p-2 mb-1"
								onSelect={() => handlePinUnpinBookmark(id, pinned)}
							>
								{pinned ? (
									<>
										<PinIcon className="text-muted-foreground rotate-45" />
										Unpin
									</>
								) : (
									<>
										<PinIcon className="text-muted-foreground" />
										Pin
									</>
								)}
							</DropdownMenuItem>

							<DropdownMenuItem
								className="focus:bg-sidebar-accent p-2 mb-1"
								onSelect={() => openUpdateBookmarkModal(bookmark)}
							>
								<SquarePen className="text-muted-foreground" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								className="focus:bg-sidebar-accent p-2 mb-1"
								onSelect={() => openArchiveUnarchiveModal('archive', id)}
							>
								<Archive className="text-muted-foreground" />
								Archive
							</DropdownMenuItem>
						</>
					)}

					{isArchived && (
						<>
							<DropdownMenuItem
								className="focus:bg-sidebar-accent p-2 mb-1"
								onSelect={() => openArchiveUnarchiveModal('unarchive', id)}
							>
								<RotateCcw className="text-muted-foreground" />
								Unarchive
							</DropdownMenuItem>

							<DropdownMenuItem
								className="focus:bg-sidebar-accent p-2 mb-1"
								onSelect={() => openDeleteBookmarkModal(id)}
							>
								<Trash2 className="text-muted-foreground" />
								Delete Permanently
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
