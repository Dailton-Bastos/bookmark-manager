import { CardsSkeleton } from './cards-skeleton'

export const PageSkeleton = () => {
	return (
		<div className="w-full p-8" role="status">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="h-8 rounded-lg w-45 bg-gray-300 animate-pulse" />
				</div>
				<div className="ml-auto flex items-center gap-4">
					<div className="w-29 h-10.5 rounded-lg bg-gray-300 animate-pulse" />
				</div>
			</div>

			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						<div className="grid grid-cols-1 gap-3 *:data-[slot=card]:shadow-md @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
							<CardsSkeleton length={12} />
						</div>
					</div>
				</div>
			</div>

			<span className="sr-only">Loading...</span>
		</div>
	)
}
