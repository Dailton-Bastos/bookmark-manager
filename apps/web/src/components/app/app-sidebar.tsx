'use client'

import Link from 'next/link'
import { LoaderCircle } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	Sidebar,
	SidebarContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from 'ui/components/shadcn/ui/sidebar'
import { useTagsInfiniteQuery } from '@/hooks/useTags'
import { Logo } from '../shared/logo'
import { NavMain } from './nav-main'
import { NavTags } from './nav-tags'
export const AppSidebar = ({
	...props
}: React.ComponentProps<typeof Sidebar>) => {
	const {
		tags,
		isPending,
		isFetching,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage
	} = useTagsInfiniteQuery({ limit: 15 })

	return (
		<Sidebar className="border-r-0" {...props}>
			<SidebarHeader className="px-4 py-3 gap-4">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							asChild
							className="hover:bg-transparent cursor-pointer"
						>
							<Link href="/">
								<Logo />
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>

				<NavMain />
			</SidebarHeader>

			<div className="flex items-center px-4">
				<SidebarGroupLabel className="font-bold uppercase">
					Tags
				</SidebarGroupLabel>

				{isFetching && (
					<LoaderCircle className="size-4 text-muted-foreground animate-spin" />
				)}
			</div>

			<SidebarContent className="px-4">
				<NavTags tags={tags} />
			</SidebarContent>

			{!isPending && hasNextPage && (
				<div className="flex justify-center p-4">
					<Button
						type="button"
						size="xs"
						variant="link"
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
						className="cursor-pointer"
					>
						{isFetchingNextPage ? 'Loading...' : 'Load more'}
					</Button>
				</div>
			)}
		</Sidebar>
	)
}
