'use client'

import { ArrowUpDown, Check } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger
} from 'ui/components/shadcn/ui/dropdown-menu'

export const SortByDropdown = () => {
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
				<DropdownMenuGroup className="font-semibold text-muted-foreground text-sm">
					<DropdownMenuItem className="focus:bg-sidebar-accent px-2 py-3">
						Recently added
						<Check className="ml-auto text-muted-foreground" />
					</DropdownMenuItem>

					<DropdownMenuItem className="focus:bg-sidebar-accent px-2 py-3">
						Recently visited
					</DropdownMenuItem>

					<DropdownMenuItem className="focus:bg-sidebar-accent px-2 py-3">
						Most visited
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
