import type * as React from 'react'

import { InputSearch } from 'ui/components/input-search'
import { Label } from 'ui/components/shadcn/ui/label'

export const SearchForm = ({ ...props }: React.ComponentProps<'form'>) => {
	return (
		<form className="w-full max-w-xs" {...props}>
			<Label htmlFor="search" className="sr-only">
				Search
			</Label>
			<InputSearch id="search" />
		</form>
	)
}
