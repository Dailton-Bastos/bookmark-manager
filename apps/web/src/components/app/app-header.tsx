import { Plus, SidebarIcon } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import { useSidebar } from 'ui/components/shadcn/ui/sidebar'
import { PrimaryButton as AddBookmarkButton } from '../shared/primary-button'
import { AvatarDropdown } from './avatar-dropdown'
import { SearchForm } from './search-form'

export const AppHeader = () => {
	const { toggleSidebar } = useSidebar()

	return (
		<header className="sticky top-0 z-50 flex w-full items-center border-b bg-primary-foreground py-4 px-8">
			<div className="flex flex-1 items-center gap-2">
				<Button
					className="h-8 w-8 lg:hidden"
					variant="ghost"
					size="icon"
					onClick={toggleSidebar}
				>
					<SidebarIcon />
				</Button>

				<SearchForm />
			</div>

			<div className="ml-auto flex items-center gap-4">
				<div className="w-full">
					<AddBookmarkButton type="button" title="Add Bookmark" icon={Plus} />
				</div>

				<AvatarDropdown />
			</div>
		</header>
	)
}
