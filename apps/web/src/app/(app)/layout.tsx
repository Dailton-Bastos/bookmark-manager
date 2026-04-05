'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useLoadingBar } from 'react-top-loading-bar'
import { authClient } from '@/lib/auth-client'
import { SessionProvider } from '@/providers/session-provider'
import { DEFAULT_UNAUTHENTICATED_REDIRECT } from '@/routes'

export default function AppLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
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

	useEffect(() => {
		if (isPending) {
			start()
			return
		}

		complete()

		return () => complete()
	}, [isPending, start, complete])

	useEffect(() => {
		if (!isPending && !session) {
			router.replace(DEFAULT_UNAUTHENTICATED_REDIRECT)
		}
	}, [isPending, session, router])

	if (error) {
		return <p>Error: {error.message}</p>
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
	if (!session) return null

	return (
		<main>
			<SessionProvider data={session}>{children}</SessionProvider>
		</main>
	)
}
