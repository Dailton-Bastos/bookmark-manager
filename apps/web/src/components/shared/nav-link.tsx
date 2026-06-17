'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'ui/components/icons'
import {
	SidebarMenuButton,
	SidebarMenuItem
} from 'ui/components/shadcn/ui/sidebar'
import { cn } from 'ui/lib/utils'
import { useSearchBookmarksStore } from '@/hooks/useBookmarks'

interface NavLinkProps {
	href: string
	icon?: LucideIcon
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

	const handleClick = () => {
		setSearchTerm('')
		setOrder('desc')
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
