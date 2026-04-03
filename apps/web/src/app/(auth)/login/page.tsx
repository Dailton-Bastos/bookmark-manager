'use client'

import type { LoginFormData } from '@repo/schemas'
import { useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { authClient } from '@/lib/auth-client'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

function getSafeCallbackUrl(callbackUrl: string | null): string {
	if (!callbackUrl) return DEFAULT_LOGIN_REDIRECT

	try {
		const decoded = decodeURIComponent(callbackUrl)

		if (decoded.startsWith('/') && !decoded.startsWith('//')) {
			return decoded
		}
	} catch {
		// decodeURIComponent failed; fall through to default
	}

	return DEFAULT_LOGIN_REDIRECT
}

export default function LoginPage() {
	const searchParams = useSearchParams()

	const callbackUrl = searchParams.get('callbackUrl')

	const handleLogin = async (data: LoginFormData): Promise<void> => {
		await authClient.signIn.email({
			email: data.email,
			password: data.password,
			callbackURL: getSafeCallbackUrl(callbackUrl)
		})
	}

	return (
		<div className="max-w-md w-full space-y-8">
			<LoginForm onSubmit={handleLogin} />
		</div>
	)
}
