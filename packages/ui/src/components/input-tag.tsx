"use client";

import { useCallback, useState } from "react";
import { Input } from "ui/components/shadcn/ui/input";
import { cn } from "../lib/utils";

interface InputTagProps extends React.ComponentProps<typeof Input> {
	addTag: (tag: string) => void;
}

export const InputTag = ({ addTag, className, ...props }: InputTagProps) => {
	const [inputValue, setInputValue] = useState("");

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setInputValue(e.target.value);
		},
		[],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				const newTag = inputValue.trim();
				if (newTag) {
					addTag(newTag);
					setInputValue("");
				}
			}
		},
		[inputValue, addTag],
	);

	return (
		<Input
			{...props}
			value={inputValue}
			onChange={handleInputChange}
			onKeyDown={handleKeyDown}
			type="text"
			autoComplete="off"
			className={cn(
				"hover:bg-secondary focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring/60",
				className,
			)}
		/>
	);
};
