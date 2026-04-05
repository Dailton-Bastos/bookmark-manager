'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { type SignupFormData, signupSchema } from '@repo/schemas'
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { InputPassword } from 'ui/components/input-password'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel
} from 'ui/components/shadcn/ui/field'
import { Input } from 'ui/components/shadcn/ui/input'
import { CardWrapper } from './card-wrapper'

interface SignupFormProps {
	onSubmit: (data: SignupFormData) => Promise<void>
	isPending: boolean
}

export const SignupForm = ({ onSubmit, isPending }: SignupFormProps) => {
	const form = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: '',
			email: '',
			password: ''
		}
	})

	return (
		<CardWrapper
			headerTitle="Create your account"
			headerDescription="Join us and start saving your favorite links — organized, searchable, and always within reach."
		>
			<form id="form-signup" onSubmit={form.handleSubmit(onSubmit)}>
				<FieldGroup className="gap-4">
					<Controller
						control={form.control}
						name="name"
						render={({ field, fieldState }) => (
							<Field className="gap-1.5" data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="name" className="text-foreground">
									Full name*
								</FieldLabel>
								<Input
									{...field}
									id="name"
									type="text"
									aria-invalid={fieldState.invalid}
									autoComplete="off"
									required
									minLength={2}
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

					<Controller
						control={form.control}
						name="email"
						render={({ field, fieldState }) => (
							<Field className="gap-1.5" data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="email" className="text-foreground">
									Email address*
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

					<Controller
						control={form.control}
						name="password"
						render={({ field, fieldState }) => (
							<Field className="gap-1.5" data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="password" className="text-foreground">
									Password*
								</FieldLabel>
								<InputPassword
									{...field}
									id="password"
									aria-invalid={fieldState.invalid}
									required
									minLength={8}
									maxLength={100}
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
							Create account
						</Button>

						<div className="flex flex-col gap-3 w-full mt-8">
							<FieldDescription className="text-center font-medium [&>a]:no-underline">
								Already have an account?{' '}
								<Link
									href="/login"
									className="font-semibold text-sm text-foreground outline-none focus-visible:p-0.5 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
								>
									Log in
								</Link>
							</FieldDescription>
						</div>
					</Field>
				</FieldGroup>
			</form>
		</CardWrapper>
	)
}
