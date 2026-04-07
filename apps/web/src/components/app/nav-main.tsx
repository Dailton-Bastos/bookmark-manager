import Link from 'next/link'
import type { LucideIcon } from 'ui/components/icons'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from 'ui/components/shadcn/ui/sidebar'
import { cn } from 'ui/lib/utils'

interface NavMainProps {
	items: {
		title: string
		url: string
		icon: LucideIcon
		isActive?: boolean
	}[]
}

export const NavMain = ({ items }: NavMainProps) => {
	return (
		<SidebarMenu>
			{items.map((item) => (
				<SidebarMenuItem key={item.title}>
					<SidebarMenuButton
						asChild
						isActive={item.isActive}
						className={cn(
							'font-semibold text-base text-muted-foreground h-9.5 p-3 [&>svg]:size-5',
							'data-[active=true]:font-semibold',
							'data-[active=true]:text-foreground'
						)}
					>
						<Link href={item.url}>
							<item.icon />
							<span>{item.title}</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			))}
		</SidebarMenu>
	)
}
