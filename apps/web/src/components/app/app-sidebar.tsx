import Link from 'next/link'
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from 'ui/components/shadcn/ui/sidebar'
import { Logo } from '../shared/logo'
import { NavMain } from './nav-main'
import { NavTags } from './nav-tags'

const dataMock = {
	tags: [
		{
			name: 'AI',
			quantity: 12
		},
		{
			name: 'Programming',
			quantity: 8
		},
		{
			name: 'Design',
			quantity: 5
		},
		{
			name: 'Travel',
			quantity: 3
		},
		{
			name: 'Food',
			quantity: 7
		},
		{
			name: 'Health',
			quantity: 4
		},
		{
			name: 'Finance',
			quantity: 6
		},
		{
			name: 'Education',
			quantity: 9
		},
		{
			name: 'Entertainment',
			quantity: 2
		}
	]
}

export const AppSidebar = ({
	...props
}: React.ComponentProps<typeof Sidebar>) => {
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

			<SidebarContent className="px-4">
				<NavTags tags={dataMock.tags} />
			</SidebarContent>
		</Sidebar>
	)
}
