'use client'

import type { LoginFormData } from '@repo/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { toast } from 'sonner'
import { LoginForm } from '@/components/auth/login-form'
import { authClient } from '@/lib/auth-client'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

function getSafeCallbackUrl(callbackUrl: string | undefined): string {
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

export default function LoginPage({
	searchParams
}: {
	searchParams: Promise<{ callbackUrl?: string }>
}) {
	const params = use(searchParams)

	const queryClient = useQueryClient()

	const router = useRouter()

	const callbackUrl = params.callbackUrl

	const { mutateAsync, isPending } = useMutation({
		mutationFn: async (formData: LoginFormData) => {
			await authClient.signIn.email(
				{
					email: formData.email,
					password: formData.password
				},
				{
					onSuccess: (ctx) => {
						if (!ctx.data?.user) return

						queryClient.setQueryData(['current-user'], ctx.data.user)
					},
					onError: (ctx) => {
						throw new Error(ctx.error.message)
					}
				}
			)
		},
		onSuccess: () => router.push(getSafeCallbackUrl(callbackUrl)),
		onSettled: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['session'] }),
				queryClient.invalidateQueries({ queryKey: ['current-user'] })
			])
		}
	})

	const onSubmit = async (data: LoginFormData) => {
		toast.promise(mutateAsync(data), {
			loading: 'Logging in...',
			success: 'Logged in successfully!',
			error: (err) => {
				if (err instanceof Error) return err.message

				return 'An error occurred while logging in.'
			}
		})
	}

	return (
		<div className="max-w-md w-full space-y-8">
			<LoginForm onSubmit={onSubmit} isPending={isPending} />
		</div>
	)
}
