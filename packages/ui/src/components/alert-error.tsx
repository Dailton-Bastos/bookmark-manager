import { CircleX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./shadcn/ui/alert";
import { Button } from "./shadcn/ui/button";

interface AlertErrorProps {
	title: string;
	description: string;
	onRetry?: () => void;
	onDismiss?: () => void;
	showRetryButton?: boolean;
	showDismissButton?: boolean;
}

export const AlertError = ({
	title,
	description,
	onRetry,
	onDismiss,
	showRetryButton = true,
	showDismissButton = true,
}: AlertErrorProps) => {
	return (
		<Alert className="flex w-full max-w-md flex-row items-start gap-3 border-destructive/80 bg-destructive/5 text-destructive">
			<CircleX className="size-4 shrink-0 translate-y-0.5 text-destructive/60" />
			<div className="flex flex-1 items-start justify-between gap-4">
				<div className="flex flex-col gap-0.5">
					<AlertTitle className="font-medium">{title}</AlertTitle>
					<AlertDescription className="text-destructive/80">
						{description}
					</AlertDescription>
				</div>
				<div className="flex shrink-0 gap-2">
					{showRetryButton && onRetry && (
						<Button
							size="sm"
							variant="destructive"
							className="cursor-pointer"
							onClick={onRetry}
						>
							Retry
						</Button>
					)}
					{showDismissButton && onDismiss && (
						<Button
							size="sm"
							variant="outline"
							className="cursor-pointer"
							onClick={onDismiss}
						>
							Dismiss
						</Button>
					)}
				</div>
			</div>
		</Alert>
	);
};
