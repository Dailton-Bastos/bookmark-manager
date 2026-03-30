'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { type LoginFormData, loginSchema } from '@repo/schemas'
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

export const LoginForm = () => {
	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	})

	const onSubmit = (data: LoginFormData) => {
		return data
	}

	return (
		<CardWrapper
			headerTitle="Log in to your account"
			headerDescription="Welcome back! Please enter your details"
		>
			<form id="form-login" onSubmit={form.handleSubmit(onSubmit)}>
				<FieldGroup className="gap-4">
					<Controller
						control={form.control}
						name="email"
						render={({ field, fieldState }) => (
							<Field className="gap-1.5" data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="email" className="text-foreground">
									Email
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
									Password
								</FieldLabel>
								<InputPassword
									{...field}
									id="password"
									aria-invalid={fieldState.invalid}
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
						>
							Log in
						</Button>

						<div className="flex flex-col gap-3 w-full mt-8">
							<FieldDescription className="text-center font-medium [&>a]:no-underline">
								Forgot password?{' '}
								<Link
									href="/forgot-password"
									className="font-semibold text-sm text-foreground outline-none focus-visible:p-0.5 focus-visible:rounded  focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
								>
									Reset it
								</Link>
							</FieldDescription>

							<FieldDescription className="text-center font-medium [&>a]:no-underline">
								Don&apos;t have an account?{' '}
								<Link
									href="/signup"
									className="font-semibold text-sm text-foreground outline-none focus-visible:p-0.5 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
								>
									Sign up
								</Link>
							</FieldDescription>
						</div>
					</Field>
				</FieldGroup>
			</form>
		</CardWrapper>
	)
}
