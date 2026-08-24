import Image from 'next/image'
import { User } from 'ui/components/icons'
import { Avatar, AvatarFallback } from 'ui/components/shadcn/ui/avatar'

interface UserAvatarProps {
	imageUrl?: string | null
	altText?: string
}

export const UserAvatar = ({ imageUrl = null, altText }: UserAvatarProps) => {
	return (
		<Avatar className="w-10 h-10 rounded-full border border-input/20 shadow-xs">
			{imageUrl ? (
				<Image
					src={imageUrl || ''}
					alt={altText || 'User Avatar'}
					width={256}
					height={256}
					className="rounded-full object-cover w-full h-full"
				/>
			) : (
				<AvatarFallback className="w-10 h-10 bg-secondary text-muted-foreground rounded-full flex items-center justify-center">
					<User className="text-muted-foreground" />
				</AvatarFallback>
			)}
		</Avatar>
	)
}
