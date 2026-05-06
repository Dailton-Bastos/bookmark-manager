const MAX_SKELETON_LENGTH = 50
const SKELETON_KEYS = Array.from(
	{ length: MAX_SKELETON_LENGTH },
	(_, i) => `skeleton-${i}`
)

interface CardsSkeletonProps {
	length?: number
}

export const CardsSkeleton = ({ length = 8 }: CardsSkeletonProps) => {
	return (
		<>
			{SKELETON_KEYS.slice(0, length).map((key) => (
				<div key={key} className="animate-pulse flex flex-col gap-2">
					<div className="relative flex flex-col text-muted-foreground bg-clip-border rounded-xl animate-pulse">
						<div className="relative grid min-h-68 overflow-hidden text-gray-700 bg-gray-300 bg-clip-border rounded-xl place-items-center" />
					</div>
				</div>
			))}
		</>
	)
}
