'use client'

import { useRouter } from 'next/navigation'
import type * as React from 'react'
import { useRef } from 'react'
import { InputSearch } from 'ui/components/input-search'
import { Label } from 'ui/components/shadcn/ui/label'
import { useSearchBookmarksStore } from '@/hooks/useBookmarks'

export const SearchForm = ({ ...props }: React.ComponentProps<'form'>) => {
	const { order, setQuery, searchTerm, setSearchTerm } =
		useSearchBookmarksStore()

	const router = useRouter()

	const inputRef = useRef<HTMLInputElement>(null)

	const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (!searchTerm.trim()) return

		setQuery(searchTerm)

		if (inputRef.current) {
			inputRef.current.blur() // Remove focus from the input after submission
		}

		return router.push(
			`/?search=${encodeURIComponent(searchTerm)}&order=${order}`
		)
	}

	return (
		<form className="w-full max-w-xs" onSubmit={onSubmit} {...props}>
			<Label htmlFor="search" className="sr-only">
				Search
			</Label>
			<InputSearch
				ref={inputRef}
				id="search"
				name="search"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>
		</form>
	)
}
