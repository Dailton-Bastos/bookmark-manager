'use client'

import type { LoginFormData } from '@repo/schemas'
import { useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { authClient } from '@/lib/auth-client'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

export default function LoginPage() {
	const searchParams = useSearchParams()

	const callbackUrl = searchParams.get('callbackUrl')

	const handleLogin = async (data: LoginFormData): Promise<void> => {
		await authClient.signIn.email({
			email: data.email,
			password: data.password,
			callbackURL: callbackUrl
				? decodeURIComponent(callbackUrl)
				: DEFAULT_LOGIN_REDIRECT
		})
	}

	return (
		<div className="max-w-md w-full space-y-8">
			<LoginForm onSubmit={handleLogin} />
		</div>
	)
}
