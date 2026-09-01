import type { Metadata } from 'next'
import { RequestPasswordResetForm } from '@/components/auth/request-password-reset-form'

export const metadata: Metadata = {
	title: 'Request Password Reset'
}

export default function RequestPasswordResetPage() {
	return (
		<div className="max-w-md w-full space-y-8">
			<RequestPasswordResetForm />
		</div>
	)
}
