import type { TagWithBookmarkCount } from '@repo/schemas'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Badge } from 'ui/components/shadcn/ui/badge'
import { Checkbox } from 'ui/components/shadcn/ui/checkbox'
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldSet
} from 'ui/components/shadcn/ui/field'
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from 'ui/components/shadcn/ui/sidebar'
import {
	useSearchBookmarksStore,
	useTagBookmarksStore
} from '@/hooks/useBookmarks'

interface NavTagsProps {
	tags: TagWithBookmarkCount[]
}

type CheckedState = boolean | 'indeterminate'

export const NavTags = ({ tags }: NavTagsProps) => {
	const { addTag, removeTag, tags: selectedTags } = useTagBookmarksStore()
	const { setQuery, searchTerm, setSearchTerm } = useSearchBookmarksStore()

	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()

	const isTaggedPage = pathname.startsWith('/tagged')

	const addTagToParams = useCallback(
		(tagId: number) => {
			const params = new URLSearchParams(searchParams.toString())

			params.append('tags', tagId.toString())

			const newUrl = `${pathname}?${params.toString()}`

			if (searchTerm) {
				setSearchTerm('') // Clear the search term when navigating to the tagged page
				setQuery('') // Clear the search query in the store
			}

			addTag(tagId)

			if (!isTaggedPage) {
				return router.push(`/tagged?${params.toString()}`)
			}

			return window.history.replaceState(null, '', newUrl)
		},
		[
			searchParams,
			pathname,
			router,
			isTaggedPage,
			searchTerm,
			setSearchTerm,
			setQuery,
			addTag
		]
	)

	const removeTagFromParams = useCallback(
		(tagId: number) => {
			const params = new URLSearchParams(searchParams.toString())
			const remainingTags = params
				.getAll('tags')
				.filter((tag) => tag !== tagId.toString())
			params.delete('tags')
			remainingTags.forEach((tag) => {
				params.append('tags', tag)
			})

			removeTag(tagId)

			const newUrl = `${pathname}?${params.toString()}`

			window.history.replaceState(null, '', newUrl)
		},
		[searchParams, pathname, removeTag]
	)

	const handleTagChange = useCallback(
		(tagId: number, checked: CheckedState) => {
			if (checked === true) {
				addTagToParams(tagId)
			} else {
				removeTagFromParams(tagId)
			}
		},
		[addTagToParams, removeTagFromParams]
	)

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden pt-1 px-0 text-muted-foreground">
			<SidebarMenu>
				<FieldSet>
					<FieldGroup className="gap-0">
						{tags.map((tag) => (
							<SidebarMenuItem key={tag.id}>
								<SidebarMenuButton asChild className="h-10.5">
									<Field orientation="horizontal">
										<Checkbox
											id={`tag-${tag.id}`}
											name={`tag-${tag.id}`}
											checked={selectedTags.includes(tag.id)}
											className="border-checkbox cursor-pointer rounded-sm focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring/60"
											onCheckedChange={(checked) => {
												handleTagChange(tag.id, checked)
											}}
										/>
										<FieldLabel
											htmlFor={`tag-${tag.id}`}
											className="flex items-center gap-2 justify-between text-base font-semibold"
										>
											{tag.name}
											<Badge
												variant="secondary"
												className="border-muted font-medium"
											>
												{tag.bookmarkCount}
											</Badge>
										</FieldLabel>
									</Field>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</FieldGroup>
				</FieldSet>
			</SidebarMenu>
		</SidebarGroup>
	)
}
