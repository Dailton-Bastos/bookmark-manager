import { Menu, Plus } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import { useSidebar } from 'ui/components/shadcn/ui/sidebar'
import { useAddBookmarkModal } from '@/hooks/useBookmarkModal'
import { PrimaryButton as AddBookmarkButton } from '../shared/primary-button'
import { AvatarDropdown } from './avatar-dropdown'
import { SearchForm } from './search-form'

export const AppHeader = () => {
	const { toggleSidebar } = useSidebar()
	const { onOpen } = useAddBookmarkModal()

	return (
		<header className="sticky top-0 z-50 flex gap-2.5 w-full items-center border-b bg-header py-3 px-4 md:py-4 md:px-8">
			<div className="flex flex-1 items-center gap-2">
				<Button
					className="w-10 h-10 border border-sidebar-border shadow-xs md:w-11 md:h-11 lg:hidden"
					variant="ghost"
					size="icon"
					aria-label="Toggle Sidebar"
					onClick={toggleSidebar}
				>
					<Menu className="w-5 h-5" />
				</Button>

				<SearchForm />
			</div>

			<div className="ml-auto flex items-center gap-2.5 md:gap-4">
				<div className="w-full">
					<AddBookmarkButton
						type="button"
						title="Add Bookmark"
						icon={Plus}
						onClick={onOpen}
						className="hidden md:flex"
					/>

					<Button
						type="button"
						size="icon"
						aria-label="Add Bookmark"
						onClick={onOpen}
						className="w-10 h-10 md:hidden"
					>
						<Plus className="w-5 h-5" />
					</Button>
				</div>

				<AvatarDropdown />
			</div>
		</header>
	)
}
