export const FormSkeleton = () => (
	<div className="max-w-md w-full space-y-8">
		<div className="space-y-4">
			<div className="h-8 w-53.5 rounded bg-muted animate-pulse" />
			<div className="h-15 w-55 rounded bg-muted animate-pulse" />
			<div className="h-18 w-full rounded bg-muted animate-pulse" />
			<div className="h-18 w-full rounded bg-muted animate-pulse" />
			<div className="h-18 w-full rounded bg-muted animate-pulse" />
			<div className="h-13 w-full rounded bg-muted animate-pulse" />
			<span className="sr-only">Loading...</span>
		</div>
	</div>
)
