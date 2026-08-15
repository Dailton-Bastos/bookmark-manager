import type { UserProfile } from '@repo/schemas'
import { LockKeyhole, UserCog } from 'ui/components/icons'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger
} from 'ui/components/shadcn/ui/tabs'
import { ProfileInfo } from './profile-info'

type ProfileTabsProps = {
	profile: UserProfile
}

export const ProfileTabs = ({ profile }: ProfileTabsProps) => {
	return (
		<Tabs defaultValue="profile" className="w-full max-w-2xl mx-auto">
			<TabsList className="w-full justify-start bg-primary-foreground">
				<TabsTrigger
					value="profile"
					className="font-semibold text-base text-muted-foreground cursor-pointer"
				>
					<UserCog className="mr-2 h-6 w-6" />
					Profile
				</TabsTrigger>

				<TabsTrigger
					value="password"
					className="font-semibold text-base text-muted-foreground cursor-pointer"
				>
					<LockKeyhole className="mr-2 h-6 w-6" />
					Password
				</TabsTrigger>
			</TabsList>

			<TabsContent value="profile">
				<ProfileInfo profile={profile} />
			</TabsContent>

			<TabsContent value="password">Password</TabsContent>
		</Tabs>
	)
}
