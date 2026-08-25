import type * as React from "react";
import { cn } from "ui/lib/utils";

export const CustomDarkThemeIcon = ({
	className,
	...props
}: React.SVGProps<SVGSVGElement>) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			fill="none"
			aria-hidden="true"
			viewBox="0 0 20 20"
			stroke="currentColor"
			className={cn("custom-icon", className)}
			{...props}
		>
			<g clipPath="url(#a)">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.667"
					d="M18.296 10.797a6.667 6.667 0 1 1-9.092-9.093 8.334 8.334 0 1 0 9.092 9.093"
				/>
			</g>
			<defs>
				<clipPath id="a">
					<path fill="#fff" d="M0 0h20v20H0z" />
				</clipPath>
			</defs>
		</svg>
	);
};
