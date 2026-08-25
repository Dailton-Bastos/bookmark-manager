"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "./shadcn/ui/input-group";

interface InputPasswordProps extends React.ComponentProps<"input"> {
	showIcon?: boolean;
}

export const InputPassword = ({
	className,
	showIcon = true,
	...props
}: InputPasswordProps) => {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<InputGroup className="h-11 rounded-lg border-chart-2 shadow-sm hover:bg-secondary focus-within:ring-offset-2 has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/60 dark:border-border">
			<InputGroupInput
				className={className}
				{...props}
				type={showPassword ? "text" : "password"}
			/>

			{showIcon && (
				<InputGroupAddon align="inline-end">
					<InputGroupButton
						aria-label={showPassword ? "Hide password" : "Show password"}
						size={"icon-sm"}
						className="cursor-pointer"
						onClick={() => setShowPassword(!showPassword)}
					>
						{showPassword ? <EyeOffIcon /> : <EyeIcon />}
					</InputGroupButton>
				</InputGroupAddon>
			)}
		</InputGroup>
	);
};
