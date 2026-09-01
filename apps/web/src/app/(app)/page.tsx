import type { ListBookmarksOrder } from '@repo/schemas'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { Dashboard } from './_components/dashboard'
import { SearchResults } from './_components/search-results'

type Props = {
	searchParams: Promise<{
		search?: string
		order?: ListBookmarksOrder
	}>
}

export async function generateMetadata({
	searchParams
}: Props): Promise<Metadata> {
	const { search } = await searchParams

	return {
		title: search ? `Search results for "${search}"` : 'Home'
	}
}

export default async function HomePage({ searchParams }: Props) {
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
