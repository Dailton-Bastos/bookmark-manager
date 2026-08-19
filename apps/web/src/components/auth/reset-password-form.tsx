'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { type ResetPasswordFormData, resetPasswordSchema } from '@repo/schemas'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { InputPassword } from 'ui/components/input-password'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel
} from 'ui/components/shadcn/ui/field'
import { orpcClient } from '@/lib/orpc-client'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { CardWrapper } from './card-wrapper'

type ResetPasswordFormProps = {
	token: string
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
	const form = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			newPassword: '',
			confirmNewPassword: '',
			token: ''
		}
	})

	const router = useRouter()

	const { isPending, mutateAsync } = useMutation(
		orpcClient.user.resetPassword.mutationOptions({
			onSuccess: () => {
				form.reset()
				router.push(DEFAULT_LOGIN_REDIRECT)
			}
		})
	)

	const onSubmit = async (data: ResetPasswordFormData) => {
		toast.promise(mutateAsync(data), {
			loading: 'Resetting password...',
			success: 'Your password has been successfully reset.',
			error: (err) => {
				if (err instanceof Error) {
					if (err.message.includes('Bad Request')) {
						return 'Invalid link or the password reset request has expired. Please request a new password reset.'
					}
				}

				return 'An error occurred while resetting the password.'
			}
		})
	}

	useEffect(() => {
		form.setValue('token', token)
	}, [token, form])

	return (
		<CardWrapper
			headerTitle="Reset your password"
			headerDescription="Enter your new password below. Make sure it is strong and secure."
		>
			<form id="form-signup" onSubmit={form.handleSubmit(onSubmit)}>
				<FieldGroup className="gap-4">
					<Controller
						control={form.control}
						name="newPassword"
						render={({ field, fieldState }) => (
							<Field className="gap-1.5" data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="newPassword" className="text-foreground">
									New password*
								</FieldLabel>
								<InputPassword
									{...field}
									id="newPassword"
									type="password"
									aria-invalid={fieldState.invalid}
									autoComplete="off"
									required
								/>
								{fieldState.invalid && (
									<FieldError
										errors={[fieldState.error]}
										className="font-medium"
									/>
								)}
							</Field>
						)}
					/>

					<Controller
						control={form.control}
						name="confirmNewPassword"
						render={({ field, fieldState }) => (
							<Field className="gap-1.5" data-invalid={fieldState.invalid}>
								<FieldLabel
									htmlFor="confirmNewPassword"
									className="text-foreground"
								>
									Confirm password*
								</FieldLabel>
								<InputPassword
									{...field}
									id="confirmNewPassword"
									type="password"
									aria-invalid={fieldState.invalid}
									autoComplete="off"
									required
								/>
								{fieldState.invalid && (
									<FieldError
										errors={[fieldState.error]}
										className="font-medium"
									/>
								)}
							</Field>
						)}
					/>

					<Field>
						<Button
							type="submit"
							className="w-full h-11.5 rounded-lg hover:bg-chart-3 cursor-pointer font-semibold"
							disabled={isPending}
						>
							Reset password
						</Button>

						<div className="flex flex-col gap-3 w-full mt-8">
							<FieldDescription className="text-center font-medium [&>a]:no-underline">
								<Link
									href="/login"
									className="font-semibold text-sm text-foreground outline-none focus-visible:p-0.5 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
								>
									Back to login
								</Link>
							</FieldDescription>
						</div>
					</Field>
				</FieldGroup>
			</form>
		</CardWrapper>
	)
}
