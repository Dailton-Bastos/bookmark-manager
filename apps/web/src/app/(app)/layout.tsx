'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { SessionProvider } from '@/providers/session-provider'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

export default function AppLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	const router = useRouter()

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

	if (isPending) {
		return <p>Loading...</p>
	}

	if (error) {
		return <p>Error: {error.message}</p>
	}

	if (!session) return router.push(DEFAULT_LOGIN_REDIRECT)

	return (
		<main>
			<SessionProvider data={session}>{children}</SessionProvider>
		</main>
	)
}
