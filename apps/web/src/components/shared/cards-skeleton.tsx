import { uuid } from '@/utils/uuid'

interface CardsSkeletonProps {
	length?: number
}

export const CardsSkeleton = ({ length = 8 }: CardsSkeletonProps) => {
	return (
		<>
			{Array.from({ length }).map((_) => (
				<div
					key={`skeleton-${uuid()}`}
					className="animate-pulse flex flex-col gap-2"
				>
					<div className="relative flex flex-col text-muted-foreground bg-clip-border rounded-xl animate-pulse">
						<div className="relative grid min-h-68 overflow-hidden text-gray-700 bg-gray-300 bg-clip-border rounded-xl place-items-center" />
					</div>
				</div>
			))}
		</>
	)
}
