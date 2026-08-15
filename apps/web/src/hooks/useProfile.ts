import type { UserProfile } from '@repo/schemas'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useLoadingBar } from 'react-top-loading-bar'
import { toast } from 'sonner'
import { orpcClient } from '@/lib/orpc-client'
import { getImageUrl } from '@/utils/get-image-url'

export const useProfile = () => {
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const { data, error, isPending, ...result } = useQuery(
		orpcClient.user.getProfile.queryOptions({
			input: {}
		})
	)

	const { start, complete } = useLoadingBar()

	useEffect(() => {
		if (isPending) {
			start()

			return
		}

		complete()

		return () => complete()
	}, [isPending, start, complete])

	useEffect(() => {
		if (error) {
			toast.error(
				'There was a problem fetching your profile information. Please try again.'
			)
		}
	}, [error])

	useEffect(() => {
		if (data) {
			setProfile({
				...data,
				image: data?.image ? getImageUrl(data.image) : null,
				createdAt: new Date(data.createdAt),
				updatedAt: new Date(data.updatedAt)
			})
		}
	}, [data])

	return {
		profile,
		error,
		...result
	}
}
