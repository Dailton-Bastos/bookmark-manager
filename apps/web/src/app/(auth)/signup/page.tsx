'use client'

import type { SignupFormData } from '@repo/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
						throw new Error(ctx.error.message)
					}
				}
			)
		},
		onSuccess: () => router.push(DEFAULT_LOGIN_REDIRECT),
		onSettled: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ['session'] }),
				queryClient.invalidateQueries({ queryKey: ['current-user'] })
			])
	})

	const onSubmit = async (data: SignupFormData) => {
		toast.promise(mutateAsync(data), {
			loading: 'Creating your account...',
			success: 'Account created successfully!',
			error: (err) => {
				let errorMessage = 'An error occurred while creating your account.'

				if (err instanceof Error) {
					if (err.message.includes('User already exists')) {
						errorMessage = 'An account with this email already exists.'
					}
				}

				return errorMessage
			}
		})
	}

	return (
		<div className="max-w-md w-full space-y-8">
			<SignupForm onSubmit={onSubmit} isPending={isPending} />
		</div>
	)
}
