import type * as React from "react";
import { cn } from "ui/lib/utils";

export const CustomHomeIcon = ({
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
				d="M6.667 14.167h6.666M9.181 2.303 3.53 6.7c-.377.294-.566.441-.702.625-.12.163-.21.347-.265.542-.062.22-.062.46-.062.938v6.03c0 .933 0 1.4.182 1.756.16.314.414.569.728.728.357.182.823.182 1.757.182h9.666c.934 0 1.4 0 1.757-.182.314-.16.569-.414.728-.728.182-.357.182-.823.182-1.757v-6.03c0-.478 0-.718-.062-.938a1.7 1.7 0 0 0-.265-.542c-.136-.184-.325-.33-.702-.625L10.82 2.303c-.293-.227-.44-.341-.601-.385a.83.83 0 0 0-.436 0c-.161.044-.308.158-.6.385"
			/>
		</svg>
	);
};
