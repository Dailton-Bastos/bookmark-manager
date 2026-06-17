"use client";

import type * as React from "react";
import { Button } from "../components/shadcn/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "../components/shadcn/ui/input-group";
import { cn } from "../lib/utils";
import { SearchIcon } from "./icons";

export const InputSearch = ({ ...props }: React.ComponentProps<"input">) => {
	return (
		<InputGroup
			className={cn(
				"h-11 rounded-lg border-sidebar-border shadow-xs focus-within:ring-offset-2",
				"hover:bg-secondary",
				"hover:border-input",
				"has-[[data-slot=input-group-control]:focus-visible]:ring-2",
				"has-[[data-slot=input-group-control]:focus-visible]:ring-ring/60",
			)}
		>
			<InputGroupInput
				id="search"
				placeholder="Search by title..."
				className="placeholder:text-muted-foreground placeholder:font-medium placeholder:text-sm"
				{...props}
			/>
			<InputGroupAddon align="inline-start">
				<Button aria-label="Search" variant="ghost" size="icon" type="submit">
					<SearchIcon className="text-muted-foreground size-5" />
				</Button>
			</InputGroupAddon>
		</InputGroup>
	);
};
