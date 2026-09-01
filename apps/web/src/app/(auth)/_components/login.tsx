'use client'

import type { LoginFormData } from '@repo/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LoginForm } from '@/components/auth/login-form'
import { authClient } from '@/lib/auth-client'
import { EMAIL_VERIFICATION_CALLBACK_URL } from '@/utils/auth-constants'
import { getSafeCallbackUrl } from '@/utils/get-safe-callback-url'

interface LoginProps {
	callbackUrl?: string
}

export const Login = ({ callbackUrl }: LoginProps) => {
	const queryClient = useQueryClient()

	const router = useRouter()

	const { mutateAsync, isPending } = useMutation({
		mutationFn: async (formData: LoginFormData) => {
			await authClient.signIn.email(
				{
					email: formData.email,
					password: formData.password
				},
				{
					onError: async (ctx) => {
						if (ctx.error.status === 403) {
							await authClient.sendVerificationEmail({
								email: formData.email,
								callbackURL: EMAIL_VERIFICATION_CALLBACK_URL
							})
							throw new Error(
								'Your account is not verified. Please check your email for the verification link.'
							)
						}

						if (ctx.error.status === 500) {
							throw new Error('Internal server error. Please try again later.')
						}

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
