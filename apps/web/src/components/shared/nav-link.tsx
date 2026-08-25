'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar
} from 'ui/components/shadcn/ui/sidebar'
import { cn } from 'ui/lib/utils'
import {
	useSearchBookmarksStore,
	useTagBookmarksStore
} from '@/hooks/useBookmarks'

interface NavLinkProps {
	href: string
	icon?: React.JSXElementConstructor<React.SVGProps<SVGSVGElement>>
	children: React.ReactNode
	className?: string
	exact?: boolean
}

export const NavLink = ({
	href,
	icon: Icon,
	children,
	className,
	exact = false
}: NavLinkProps) => {
	const pathname = usePathname()

	const isActive = exact ? pathname === href : pathname?.startsWith(href)

	const { setSearchTerm, setOrder } = useSearchBookmarksStore()

	const { setTags } = useTagBookmarksStore()
	const { setOpenMobile } = useSidebar()

	const handleClick = () => {
		setOpenMobile(false) // Close the sidebar on mobile when a link is clicked
		setSearchTerm('')
		setOrder('desc')
		setTags([]) // Clear selected tags when navigating
	}

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={isActive}
				className={cn(
					'font-semibold text-base text-muted-foreground h-9.5 p-3 [&>svg]:size-5',
					'data-[active=true]:font-semibold',
					'data-[active=true]:text-foreground',
					className
				)}
			>
				<Link href={href} onClick={handleClick}>
					{Icon && <Icon />}
					<span>{children}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	)
}
