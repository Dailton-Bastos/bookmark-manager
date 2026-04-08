import Link from 'next/link'
import { LogOutIcon, MoonIcon, PaletteIcon, SunIcon } from 'ui/components/icons'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from 'ui/components/shadcn/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from 'ui/components/shadcn/ui/tabs'
import { useSession } from '@/providers/session-provider'
import { UserAvatar } from '../shared/user-avatar'

export const AvatarDropdown = () => {
	const { user } = useSession()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full cursor-pointer"
				>
					<UserAvatar imageUrl={user?.image} altText={user?.name || ''} />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				sideOffset={12}
				className="max-w-62 shadow-lg rounded-lg py-1 border border-secondary"
			>
				<DropdownMenuGroup className="font-semibold text-muted-foreground text-sm">
					<DropdownMenuItem
						asChild
						className="cursor-pointer focus:bg-transparent"
					>
						<Link href="/profile" className="flex items-center gap-3 px-3 py-2">
							<div className="w-10 h-10">
								<UserAvatar imageUrl={user?.image} altText={user?.name || ''} />
							</div>
							<div className="flex flex-col min-w-0 gap-1 text-sm">
								<span className="font-bold leading-none truncate text-ellipsis text-foreground">
									{user?.name || ''}
								</span>
								<span className="font-medium truncate text-ellipsis text-muted-foreground">
									{user?.email || ''}
								</span>
							</div>
						</Link>
					</DropdownMenuItem>

					<DropdownMenuSeparator className="bg-input/20" />

					<div className="px-2">
						<DropdownMenuItem
							onSelect={(e) => e.preventDefault()}
							className="py-2 focus:bg-sidebar-accent"
						>
							<div className="flex items-center gap-2">
								<PaletteIcon className="w-4 h-4" />
								Theme
							</div>

							<Tabs defaultValue="light" className="ml-auto">
								<TabsList>
									<TabsTrigger
										value="light"
										aria-label='Theme "light"'
										title="Light theme"
										className="text-foreground cursor-pointer data-[state=active]:bg-card"
									>
										<SunIcon className="w-4 h-4" />
									</TabsTrigger>

									<TabsTrigger
										value="dark"
										aria-label='Theme "dark"'
										title="Dark theme"
										className="text-foreground cursor-pointer data-[state=active]:bg-card"
									>
										<MoonIcon className="w-4 h-4" />
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</DropdownMenuItem>
					</div>

					<DropdownMenuSeparator className="bg-input/20" />

					<div className="px-2">
						<DropdownMenuItem className="cursor-pointer focus:bg-sidebar-accent px-2 py-3">
							<LogOutIcon className="w-4 h-4" />
							Logout
						</DropdownMenuItem>
					</div>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
