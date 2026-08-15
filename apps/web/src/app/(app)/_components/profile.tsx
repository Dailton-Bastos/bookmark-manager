'use client'

import { ProfileTabs } from '@/components/profile/profile-tabs'
import { useProfile } from '@/hooks/useProfile'

export const Profile = () => {
	const { profile, isLoading } = useProfile()

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<p>Loading...</p>
			</div>
		)
	}

	if (!profile) {
		return (
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<p>This user could not be found.</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			<ProfileTabs profile={profile} />
		</div>
	)
}
