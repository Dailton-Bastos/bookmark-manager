import type { Metadata } from 'next'
import { RequestEmailVerificationForm } from '@/components/auth/request-email-verification-form'

export const metadata: Metadata = {
	title: 'Request Email Verification'
}

export default function RequestEmailVerificationPage() {
	return (
		<div className="max-w-md w-full space-y-8">
			<RequestEmailVerificationForm />
		</div>
	)
}
