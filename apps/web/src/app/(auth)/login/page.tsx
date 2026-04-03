'use client'

import type { LoginFormData } from '@repo/schemas'
import { LoginForm } from '@/components/auth/login-form'
import { authClient } from '@/lib/auth-client'

export default function LoginPage() {
	const handleLogin = async (data: LoginFormData): Promise<void> => {
		await authClient.signIn.email({
			email: data.email,
			password: data.password
		})
	}

	return (
		<div className="max-w-md w-full space-y-8">
			<LoginForm onSubmit={handleLogin} />
		</div>
	)
}
