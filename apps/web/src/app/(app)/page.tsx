import type { ListBookmarksOrder } from '@repo/schemas'
import { Suspense } from 'react'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { Dashboard } from './_components/dashboard'
import { SearchResults } from './_components/search-results'

export default async function HomePage({
	searchParams
}: {
	searchParams: Promise<{
		search?: string
		order?: ListBookmarksOrder
	}>
}) {
	const { search, order } = await searchParams

	return (
		<Suspense
			key={`search-${search}-order-${order}`}
			fallback={<PageSkeleton />}
		>
			{search ? <SearchResults params={{ search, order }} /> : <Dashboard />}
		</Suspense>
	)
}
