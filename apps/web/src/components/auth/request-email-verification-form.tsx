'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	type RequestEmailVerificationFormData,
	requestEmailVerificationSchema
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
import { authClient } from '@/lib/auth-client'
import { EMAIL_VERIFICATION_CALLBACK_URL } from '@/utils/constants'
import { CardWrapper } from './card-wrapper'

export const RequestEmailVerificationForm = () => {
	const form = useForm<RequestEmailVerificationFormData>({
		resolver: zodResolver(requestEmailVerificationSchema),
		defaultValues: {
			email: ''
		}
	})

	const { mutateAsync, isPending } = useMutation({
		mutationFn: async ({ email }: RequestEmailVerificationFormData) => {
			await authClient.sendVerificationEmail(
				{
					email,
					callbackURL: EMAIL_VERIFICATION_CALLBACK_URL
				},
				{
					onError: async (ctx) => {
						throw new Error(ctx.error.message)
					},
					onSuccess: () => form.reset()
				}
			)
		}
	})

	const onSubmit = async (data: RequestEmailVerificationFormData) => {
		toast.promise(mutateAsync(data), {
			loading: 'Sending email verification link...',
			success:
				'If this email exists in our system, check your email for the verification link.',
			error: (err) => {
				if (err instanceof Error) {
					if (err.message.includes('Bad Request')) {
						return 'Please check your email for the verification link.'
					}
				}
				return 'An error occurred while sending the email verification link.'
			},
			duration: 5000
		})
	}

	return (
		<CardWrapper
			headerTitle="Request email verification"
			headerDescription="Enter your email address below and we'll send you a link to verify your email."
		>
			<form
				id="form-request-email-verification"
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
							Request a new email verification
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
