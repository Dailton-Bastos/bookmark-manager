'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	type UpdateUserPasswordInput,
	updateUserPasswordSchema
} from '@repo/schemas'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { InputPassword } from 'ui/components/input-password'
import { Button } from 'ui/components/shadcn/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from 'ui/components/shadcn/ui/card'
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel
} from 'ui/components/shadcn/ui/field'
import { orpcClient } from '@/lib/orpc-client'

export const ProfilePassword = () => {
	const form = useForm<UpdateUserPasswordInput>({
		resolver: zodResolver(updateUserPasswordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: '',
			revokeOtherSessions: false
		}
	})

	const { mutateAsync, isPending } = useMutation(
		orpcClient.user.updatePassword.mutationOptions({
			onSuccess: () =>
				form.reset({
					currentPassword: '',
					newPassword: '',
					confirmNewPassword: '',
					revokeOtherSessions: false
				})
		})
	)

	const onSubmit = async (data: UpdateUserPasswordInput) => {
		toast.promise(mutateAsync(data), {
			loading: 'Updating password...',
			success: 'Password updated successfully!',
			error: (err) => {
				if (err instanceof Error) {
					if (err.message.includes('Bad Request')) {
						return 'Please check your credentials and try again.'
					}
				}

				return 'An error occurred while updating the password.'
			}
		})
	}

	useEffect(() => {
		form.reset({
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: '',
			revokeOtherSessions: false
		})
	}, [form])

	return (
		<Card className="w-full px-8 py-10 gap-8 rounded-xl">
			<CardHeader className="w-full">
				<CardTitle>
					<h1 className="text-2xl text-left font-bold text-foreground">
						Change Password
					</h1>
				</CardTitle>
				<CardDescription className="text-sm text-left font-medium text-muted-foreground">
					Manage your password information.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form id="form-password" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup className="gap-4">
						<Controller
							control={form.control}
							name="currentPassword"
							render={({ field, fieldState }) => (
								<Field className="gap-1.5" data-invalid={fieldState.invalid}>
									<FieldLabel
										htmlFor="currentPassword"
										className="text-foreground"
									>
										Current password
									</FieldLabel>
									<InputPassword
										{...field}
										id="currentPassword"
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
							name="newPassword"
							render={({ field, fieldState }) => (
								<Field className="gap-1.5" data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="newPassword" className="text-foreground">
										New password
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
										Confirm new password
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
					</FieldGroup>

					<div className="flex justify-end mt-8">
						<Button
							type="submit"
							className="w-fit h-11.5 rounded-lg hover:bg-chart-3 cursor-pointer font-semibold"
							disabled={isPending}
						>
							Save Password
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}
