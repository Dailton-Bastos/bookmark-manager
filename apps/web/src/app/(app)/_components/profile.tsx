'use client'

import { useEffect } from 'react'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { useSession } from '@/providers/session-provider'
import { APP_NAME } from '@/utils/constants'

export const Profile = () => {
	const { user } = useSession()

	useEffect(() => {
		if (!user) return

		document.title = `${user.name}'s Profile | ${APP_NAME}`
	}, [user])

	if (!user) {
		return (
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<p>This user could not be found.</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			<ProfileTabs />
		</div>
	)
}
