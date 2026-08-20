'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
	type RequestPasswordResetFormData,
	requestPasswordResetSchema
} from '@repo/schemas'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel
} from 'ui/components/shadcn/ui/field'
import { Input } from 'ui/components/shadcn/ui/input'
import { orpcClient } from '@/lib/orpc-client'
import { CardWrapper } from './card-wrapper'

export const RequestPasswordResetForm = () => {
	const form = useForm<RequestPasswordResetFormData>({
		resolver: zodResolver(requestPasswordResetSchema),
		defaultValues: {
			email: ''
		}
	})

	const { isPending, mutateAsync } = useMutation(
		orpcClient.user.requestPasswordReset.mutationOptions({
			onSuccess: () => form.reset()
		})
	)

	const onSubmit = async (data: RequestPasswordResetFormData) => {
		toast.promise(mutateAsync(data), {
			loading: 'Sending password reset link...',
			success:
				'If this email exists in our system, check your email for the reset link.',
			error: (err) => {
				if (err instanceof Error) {
					if (err.message.includes('Bad Request')) {
						return 'Please check your email for the reset link.'
					}
				}

				return 'An error occurred while sending the password reset link.'
			},
			duration: 5000
		})
	}

	return (
		<CardWrapper
			headerTitle="Forgot your password?"
			headerDescription="Enter your email address below and we'll send you a link to reset your password."
		>
			<form
				id="form-request-password-reset"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FieldGroup className="gap-4">
					<Controller
						control={form.control}
						name="email"
						render={({ field, fieldState }) => (
							<Field className="gap-1.5" data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="email" className="text-foreground">
									Email*
								</FieldLabel>
								<Input
									{...field}
									id="email"
									type="email"
									aria-invalid={fieldState.invalid}
									autoComplete="off"
									required
									className="hover:bg-secondary focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring/60"
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
							Send reset link
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
