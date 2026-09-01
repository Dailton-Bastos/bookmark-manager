import type { Metadata } from 'next'
import { Profile } from '../_components/profile'

export const metadata: Metadata = {
	title: 'Profile'
}

export default function ProfilePage() {
	return (
		<div className="w-full py-4 px-6 md:py-8 md:px-8">
			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<Profile />
				</div>
			</div>
		</div>
	)
}
