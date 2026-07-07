import type { ListBookmarksOrder } from '@repo/schemas'
import { Suspense } from 'react'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { TaggedBookmarks } from '../_components/tagged-bookmarks'

type SearchParams = Promise<{
	tags?: string | string[]
	order?: ListBookmarksOrder
}>

export default async function BookmarksTaggedPage({
	searchParams
}: {
	searchParams: SearchParams
}) {
	const resolvedSearchParams = await searchParams

	// Use URLSearchParams to accurately parse multiple keys into an array
	const params = new URLSearchParams(
		resolvedSearchParams as Record<string, string>
	)

	const rawTags = params.getAll('tags')

	const tags: number[] = rawTags
		.flatMap((tag) => (tag.includes(',') ? tag.split(',') : tag))
		.filter(Boolean)
		.map((tag) => parseInt(tag, 10))
		.filter((tag) => !Number.isNaN(tag) && Number.isInteger(tag) && tag > 0)

	const order = params.get('order') as ListBookmarksOrder | undefined

	return (
		<Suspense
			key={`tags-${tags.join(',')}-order-${order}`}
			fallback={<PageSkeleton />}
		>
			<TaggedBookmarks params={{ tags, order }} />
		</Suspense>
	)
}
