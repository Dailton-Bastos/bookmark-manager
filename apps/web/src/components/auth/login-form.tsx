'use client'

import Link from 'next/link'
import { InputPassword } from 'ui/components/input-password'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel
} from 'ui/components/shadcn/ui/field'
import { Input } from 'ui/components/shadcn/ui/input'
import { CardWrapper } from './card-wrapper'

export const LoginForm = () => {
	return (
		<CardWrapper
			headerTitle="Log in to your account"
			headerDescription="Welcome back! Please enter your details"
		>
			<form>
				<FieldGroup className="gap-4">
					<Field className="gap-1.5">
						<FieldLabel htmlFor="email" className="text-foreground">
							Email
						</FieldLabel>
						<Input
							id="email"
							type="email"
							required
							className="hover:bg-secondary focus-within:ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring/60"
						/>
					</Field>

					<Field className="gap-1.5">
						<FieldLabel htmlFor="password" className="text-foreground">
							Password
						</FieldLabel>
						<InputPassword id="password" required />
					</Field>

					<Field>
						<Button type="submit" className="w-full">
							Log in
						</Button>

						<div className="flex flex-col gap-3 w-full mt-8">
							<FieldDescription className="text-center font-medium [&>a]:no-underline">
								Forgot password?{' '}
								<Link
									href="/forgot-password"
									className="font-semibold text-sm text-foreground outline-none focus-visible:p-0.5 focus-visible:rounded  focus-visible:ring-2 focus-visible:ring-ring/60 focus-within:ring-offset-2"
								>
									Reset it
								</Link>
							</FieldDescription>

							<FieldDescription className="text-center font-medium [&>a]:no-underline">
								Don&apos;t have an account?{' '}
								<Link
									href="/signup"
									className="font-semibold text-sm text-foreground outline-none focus-visible:p-0.5 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring/60 focus-within:ring-offset-2"
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
