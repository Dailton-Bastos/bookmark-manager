'use client'

import type { LoginFormData } from '@repo/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { toast } from 'sonner'
import { LoginForm } from '@/components/auth/login-form'
import { authClient } from '@/lib/auth-client'
import { getSafeCallbackUrl } from '@/utils/get-safe-callback-url'

export const Login = ({
	searchParams
}: {
	searchParams: Promise<{ callbackUrl?: string }>
}) => {
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
					onError: (ctx) => {
						throw new Error(ctx.error.message)
					}
				}
			)
		},
		onSuccess: () => router.push(getSafeCallbackUrl(callbackUrl)),
		onSettled: () => queryClient.invalidateQueries({ queryKey: ['session'] })
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

	return <LoginForm onSubmit={onSubmit} isPending={isPending} />
}
