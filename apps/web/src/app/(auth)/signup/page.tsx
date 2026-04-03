'use client'

import type { SignupFormData } from '@repo/schemas'
import { SignupForm } from '@/components/auth/signup-form'
import { authClient } from '@/lib/auth-client'

export default function SignupPage() {
	const handleSignup = async (data: SignupFormData): Promise<void> => {
		await authClient.signUp.email({
			email: data.email,
			password: data.password,
			name: data.name
		})
	}

	return (
		<div className="max-w-md w-full space-y-8">
			<SignupForm onSubmit={handleSignup} />
		</div>
	)
}
