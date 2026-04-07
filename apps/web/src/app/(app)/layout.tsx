'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useLoadingBar } from 'react-top-loading-bar'
import { AlertError } from 'ui/components/alert-error'
import { SidebarInset, SidebarProvider } from 'ui/components/shadcn/ui/sidebar'
import { AppHeader } from '@/components/app/app-header'
import { AppSidebar } from '@/components/app/app-sidebar'
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
		return (
			<main className="flex items-center justify-end w-full p-4">
				<AlertError
					title="Ops! Something went wrong"
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
	if (!session) return null

	return (
		<div className="[--header-height:calc(--spacing(14))]">
			<SessionProvider data={session}>
				<SidebarProvider
					style={
						{
							'--sidebar-width': '18.5rem',
							'--sidebar-width-mobile': '18rem'
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
