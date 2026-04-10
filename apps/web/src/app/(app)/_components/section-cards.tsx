'use client'

import { Bookmark } from '@/components/shared/bookmark'

export const SectionCards = () => {
	return (
		<div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-md @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
			<Bookmark />
			<Bookmark />
			<Bookmark />
			<Bookmark />
			<Bookmark />
			<Bookmark />
		</div>
	)
}
