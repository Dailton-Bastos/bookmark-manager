import { SidebarIcon } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import { useSidebar } from 'ui/components/shadcn/ui/sidebar'

export const AppHeader = () => {
	const { toggleSidebar } = useSidebar()

	return (
		<header className="sticky top-0 z-50 flex w-full items-center border-b bg-primary-foreground">
			<div className="flex h-(--header-height) w-full items-center gap-2 px-4">
				<Button
					className="h-8 w-8"
					variant="ghost"
					size="icon"
					onClick={toggleSidebar}
				>
					<SidebarIcon />
				</Button>
			</div>
		</header>
	)
}
