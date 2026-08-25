import type * as React from "react";
import { cn } from "ui/lib/utils";

export const CustomPinIcon = ({
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
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.6"
				d="M10 12.5v5.833M6.668 6.09v1.776c0 .173 0 .26-.017.343a.8.8 0 0 1-.074.211c-.039.076-.093.143-.201.279l-1.308 1.635c-.555.693-.832 1.04-.833 1.332 0 .254.115.494.314.652.228.182.672.182 1.56.182h7.785c.888 0 1.332 0 1.56-.182a.83.83 0 0 0 .314-.652c0-.292-.278-.639-.833-1.332l-1.308-1.635a2 2 0 0 1-.2-.279.8.8 0 0 1-.075-.211c-.017-.083-.017-.17-.017-.343V6.09c0-.096 0-.144.005-.191a1 1 0 0 1 .024-.125c.013-.045.03-.09.066-.18l.84-2.099c.245-.612.368-.919.317-1.165a.83.83 0 0 0-.356-.525c-.21-.138-.54-.138-1.199-.138H6.97c-.66 0-.99 0-1.2.138a.83.83 0 0 0-.355.525c-.05.246.072.553.317 1.165l.84 2.1c.035.089.053.134.066.18q.016.06.024.124c.005.047.005.095.005.191"
			/>
		</svg>
	);
};
