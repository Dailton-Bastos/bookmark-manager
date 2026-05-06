'use client'

import type { ListBookmarksOrder } from '@repo/schemas'
import { ArrowUpDown } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger
} from 'ui/components/shadcn/ui/dropdown-menu'

interface SortByDropdownProps {
	order: ListBookmarksOrder
	setOrder: (order: ListBookmarksOrder) => void
}

export const SortByDropdown = ({ order, setOrder }: SortByDropdownProps) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="lg"
					className="cursor-pointer bg-popover border border-accent rounded-lg h-10.5 text-foreground font-semibold text-base hover:bg-secondary"
				>
					<ArrowUpDown className="size-5 text-foreground" />
					Sort by
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				className="min-w-50 max-w-50 shadow-lg rounded-lg py-1 border border-secondary"
			>
				<DropdownMenuRadioGroup
					value={order}
					onValueChange={(value) => setOrder(value as ListBookmarksOrder)}
					className="font-semibold text-muted-foreground text-sm"
				>
					<DropdownMenuRadioItem
						className="focus:bg-sidebar-accent px-2 py-3"
						value="desc"
					>
						Recently added
					</DropdownMenuRadioItem>

					<DropdownMenuRadioItem
						className="focus:bg-sidebar-accent px-2 py-3"
						value="recently_visited"
					>
						Recently visited
					</DropdownMenuRadioItem>

					<DropdownMenuRadioItem
						className="focus:bg-sidebar-accent px-2 py-3"
						value="most_visited"
					>
						Most visited
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
