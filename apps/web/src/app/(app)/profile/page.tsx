import { Profile } from '../_components/profile'

export default function ProfilePage() {
	return (
		<div className="w-full p-8">
			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<Profile />
				</div>
			</div>
		</div>
	)
}
