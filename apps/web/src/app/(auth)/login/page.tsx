import { Suspense } from 'react'
import { FormSkeleton } from '@/components/auth/form-skeleton'
import { Login } from '../_components/login'

export default function LoginPage({
	searchParams
}: {
	searchParams: Promise<{ callbackUrl?: string }>
}) {
	return (
		<div className="max-w-md w-full space-y-8">
			<Suspense fallback={<FormSkeleton />}>
				<Login searchParams={searchParams} />
			</Suspense>
		</div>
	)
}
