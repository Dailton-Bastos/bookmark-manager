import { Bookmark } from '@/components/shared/bookmark'

interface Bookmark {
	id: string
	title: string
	url: string
	favicon: string | null
	description: string
	tags: string[]
	pinned: boolean
	isArchived: boolean
	visitCount: number
	createdAt: string
	lastVisited: string | null
}

interface SectionCardsProps {
	bookmarks: Bookmark[]
}

export const SectionCards = ({ bookmarks = [] }: SectionCardsProps) => {
	return (
		<div className="grid grid-cols-1 gap-6 *:data-[slot=card]:shadow-md @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
			{bookmarks.map((bookmark) => (
				<Bookmark key={bookmark.id} {...bookmark} />
			))}
		</div>
	)
}
