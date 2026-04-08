import {
	Avatar,
	AvatarFallback,
	AvatarImage
} from 'ui/components/shadcn/ui/avatar'

interface UserAvatarProps {
	imageUrl?: string
	altText?: string
}

export const UserAvatar = ({ imageUrl, altText }: UserAvatarProps) => {
	return (
		<Avatar size="lg">
			<AvatarImage src={imageUrl} alt={altText} className="grayscale" />
			<AvatarFallback>CN</AvatarFallback>
		</Avatar>
	)
}
