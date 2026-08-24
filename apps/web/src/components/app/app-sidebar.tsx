'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LoaderCircle, X } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	Sidebar,
	SidebarContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar
} from 'ui/components/shadcn/ui/sidebar'
import { useTagBookmarksStore } from '@/hooks/useBookmarks'
import { useTagsQuery } from '@/hooks/useTags'
import { Logo } from '../shared/logo'
import { NavMain } from './nav-main'
import { NavTags } from './nav-tags'
export const AppSidebar = ({
	...props
}: React.ComponentProps<typeof Sidebar>) => {
	const {
		tags,
		isFetching,
		viewAllTags,
		viewLessTags,
		canViewAllTags,
		isExpanded,
		remainingTagsCount
	} = useTagsQuery()

	const { setOpenMobile } = useSidebar()

	const router = useRouter()

	const { tags: selectedTags, setTags } = useTagBookmarksStore()

	const handleResetSelectedTags = () => {
		setTags([])
		router.push('/')
	}

	const shouldShowViewMoreButton = canViewAllTags && remainingTagsCount > 0
	const shouldShowViewLessButton = isExpanded && tags.length > 0
	const shouldShowResetSelectedTagsButton = selectedTags.length > 0

	return (
		<Sidebar className="border-r-0" {...props}>
			<SidebarHeader className="px-4 py-3 gap-4">
				<SidebarMenu className="relative lg:static">
					<div className="flex items-center justify-end w-full absolute -top-1.5 -right-1.5 z-1 lg:hidden">
						<Button
							className="w-8 h-8"
							variant="ghost"
							size="icon"
							aria-label="Close Sidebar"
							onClick={() => setOpenMobile(false)}
						>
							<X className="w-5 h-5" />
						</Button>
					</div>

					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							asChild
							className="hover:bg-transparent cursor-pointer w-fit"
						>
							<Link
								href="/"
								className="pointer-events-none md:pointer-events-auto"
							>
								<Logo />
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>

				<NavMain />
			</SidebarHeader>

			<div className="flex items-center justify-around w-full px-4">
				<div className="flex items-center gap-2 w-full">
					<SidebarGroupLabel className="font-bold uppercase">
						Tags
					</SidebarGroupLabel>

					{isFetching && (
						<LoaderCircle className="size-4 text-muted-foreground animate-spin" />
					)}
				</div>

				{shouldShowResetSelectedTagsButton && (
					<Button
						type="button"
						size="xs"
						variant="link"
						onClick={handleResetSelectedTags}
						disabled={isFetching}
						className="cursor-pointer underline text-muted-foreground"
					>
						Reset
					</Button>
				)}
			</div>

			<SidebarContent className="px-4">
				<NavTags tags={tags} />

				<div className="flex items-center justify-start pb-4">
					{shouldShowViewMoreButton && (
						<Button
							type="button"
							size="xs"
							variant="link"
							onClick={viewAllTags}
							disabled={isFetching}
							className="cursor-pointer text-muted-foreground"
						>
							{isFetching ? 'Loading...' : `View more (${remainingTagsCount})`}
						</Button>
					)}

					{shouldShowViewLessButton && (
						<Button
							type="button"
							size="xs"
							variant="link"
							onClick={viewLessTags}
							disabled={isFetching}
							className="cursor-pointer text-muted-foreground"
						>
							{isFetching ? 'Loading...' : 'View less'}
						</Button>
					)}
				</div>
			</SidebarContent>
		</Sidebar>
	)
}
