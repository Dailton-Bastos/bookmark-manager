import { Button } from 'ui/components/shadcn/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from 'ui/components/shadcn/ui/dropdown-menu'
import { useSession } from '@/providers/session-provider'
import { UserAvatar } from '../shared/user-avatar'

export const AvatarDropdown = () => {
	const { user } = useSession()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-full">
					<UserAvatar
						imageUrl={user?.image || 'https://github.com/shadcn.png'}
						altText={user?.name || '@shadcn'}
					/>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-32">
				<DropdownMenuGroup>
					<DropdownMenuItem>Profile</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem variant="destructive">Logout</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
