import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FormSkeleton } from '@/components/auth/form-skeleton'
import { Login } from '../_components/login'

export const metadata: Metadata = {
	title: 'Login'
}

export default async function LoginPage({
	searchParams
}: {
	searchParams: Promise<{ callbackUrl?: string }>
}) {
	const { callbackUrl } = await searchParams

	return (
		<div className="max-w-md w-full space-y-8">
			<Suspense fallback={<FormSkeleton />}>
				<Login callbackUrl={callbackUrl} />
			</Suspense>
		</div>
	)
}
