'use client'

import type { UserProfile } from '@repo/schemas'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useLoadingBar } from 'react-top-loading-bar'
import { AlertError } from 'ui/components/alert-error'
import { SidebarInset, SidebarProvider } from 'ui/components/shadcn/ui/sidebar'
import { AppHeader } from '@/components/app/app-header'
import { AppSidebar } from '@/components/app/app-sidebar'
import { authClient } from '@/lib/auth-client'
import { orpcClient } from '@/lib/orpc-client'
import { SessionProvider } from '@/providers/session-provider'
import { DEFAULT_UNAUTHENTICATED_REDIRECT } from '@/routes'
import { getImageUrl } from '@/utils/get-image-url'

export default function AppLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	const [profile, setProfile] = useState<UserProfile | null>(null)

	const router = useRouter()

	const { start, complete } = useLoadingBar()

	const {
		error,
		data: session,
		isPending
	} = useQuery({
		queryKey: ['session'],
		queryFn: async () => {
			const { data: session, error } = await authClient.getSession()

			if (error) {
				throw new Error(error.message)
			}

			return session
		},
		retry: 3
	})

	const {
		data: profileData,
		error: profileError,
		isPending: profileIsPending
	} = useQuery(
		orpcClient.user.getProfile.queryOptions({
			input: {},
			enabled: !!session?.user?.id
		})
	)

	useEffect(() => {
		if (isPending || profileIsPending) {
			start()
			return
		}

		complete()

		return () => complete()
	}, [isPending, profileIsPending, start, complete])

	useEffect(() => {
		if (!isPending && !profileIsPending && !session && !profile) {
			router.replace(DEFAULT_UNAUTHENTICATED_REDIRECT)
		}
	}, [isPending, profileIsPending, session, router, profile])

	useEffect(() => {
		if (profileData) {
			setProfile({
				...profileData,
				image: profileData?.image ? getImageUrl(profileData.image) : null,
				createdAt: new Date(profileData.createdAt),
				updatedAt: new Date(profileData.updatedAt)
			})
		}
	}, [profileData])

	useEffect(() => {
		if (profileError) return router.push(DEFAULT_UNAUTHENTICATED_REDIRECT)
	}, [router, profileError])

	const sessionWithProfile = useMemo(() => {
		if (!session || !profile) return null

		return {
			...session,
			user: profile
		}
	}, [session, profile])

	if (error) {
		return (
			<main className="flex items-center justify-end w-full p-4">
				<AlertError
					title="Oops! Something went wrong"
					description="There was a problem processing your request. Please try again."
					showDismissButton={false}
					onRetry={() => router.refresh()}
				/>
			</main>
		)
	}

	if (isPending) {
		return (
			<main>
				<p role="status" aria-live="polite" className="sr-only">
					Loading session...
				</p>
			</main>
		)
	}
	if (!sessionWithProfile) {
		return (
			<main>
				<p role="status" aria-live="polite" className="sr-only">
					This user could not be found. Please try again.
				</p>
			</main>
		)
	}

	return (
		<div className="[--header-height:calc(--spacing(14))]">
			<SessionProvider data={sessionWithProfile}>
				<SidebarProvider
					style={
						{
							'--sidebar-width': '18.5rem'
						} as React.CSSProperties
					}
				>
					<AppSidebar />
					<SidebarInset>
						<AppHeader />
						{children}
					</SidebarInset>
				</SidebarProvider>
			</SessionProvider>
		</div>
	)
}
