'use client'

import type { SignupFormData } from '@repo/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { SignupForm } from '@/components/auth/signup-form'
import { authClient } from '@/lib/auth-client'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

export default function SignupPage() {
	const router = useRouter()

	const queryClient = useQueryClient()

	const { mutateAsync, isPending } = useMutation({
		mutationFn: async (formData: SignupFormData) => {
			await authClient.signUp.email(
				{
					email: formData.email,
					password: formData.password,
					name: formData.name
				},
				{
					onSuccess: (ctx) => {
						if (!ctx.data?.user) return

						queryClient.setQueryData(['current-user'], ctx.data.user)
					},
					onError: (ctx) => {
						throw new Error(ctx.error?.message || 'Signup failed')
					}
				}
			)
		},
		onSuccess: () => router.push(DEFAULT_LOGIN_REDIRECT),
		onError: (error) =>
			alert(error instanceof Error ? error.message : 'An error occurred'),
		onSettled: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ['session'] }),
				queryClient.invalidateQueries({ queryKey: ['current-user'] })
			])
	})

	return (
		<div className="max-w-md w-full space-y-8">
			<SignupForm
				onSubmit={(data: SignupFormData) => mutateAsync(data)}
				isPending={isPending}
			/>
		</div>
	)
}
