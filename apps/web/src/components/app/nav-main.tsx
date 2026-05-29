'use client'

import { Archive, Home } from 'ui/components/icons'
import { SidebarMenu } from 'ui/components/shadcn/ui/sidebar'
import { NavLink } from '../shared/nav-link'

export const NavMain = () => {
	return (
		<SidebarMenu>
			<NavLink href="/" icon={Home} exact>
				Home
			</NavLink>

			<NavLink href="/archived" icon={Archive}>
				Archived
			</NavLink>
		</SidebarMenu>
	)
}
