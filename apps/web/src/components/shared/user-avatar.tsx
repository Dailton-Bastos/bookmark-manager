import { User } from 'ui/components/icons'
import {
	Avatar,
	AvatarFallback,
	AvatarImage
} from 'ui/components/shadcn/ui/avatar'

interface UserAvatarProps {
	imageUrl?: string | null
	altText?: string
}

export const UserAvatar = ({ imageUrl = null, altText }: UserAvatarProps) => {
	return (
		<Avatar size="lg">
			{imageUrl ? (
				<AvatarImage src={imageUrl} alt={altText} className="grayscale" />
			) : (
				<AvatarFallback className="w-10 h-10 bg-secondary text-muted-foreground rounded-full flex items-center justify-center">
					<User className="text-muted-foreground" />
				</AvatarFallback>
			)}
		</Avatar>
	)
}
