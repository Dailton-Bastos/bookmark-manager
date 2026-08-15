'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
	type UpdateUserProfileInput,
	type UserProfile,
	updateUserProfileSchema
} from '@repo/schemas'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
import { Input } from 'ui/components/shadcn/ui/input'
import { useFileSelect } from '@/hooks/useFileSelect'
import { ImageUpload } from '../shared/image-upload'

type ProfileTabsProps = {
	profile: UserProfile
}

export const ProfileInfo = ({ profile }: ProfileTabsProps) => {
	const { clearSelection, handleFileSelect, preview, setPreview } =
		useFileSelect()

	const form = useForm<UpdateUserProfileInput>({
		resolver: zodResolver(updateUserProfileSchema),
		defaultValues: {
			name: profile.name,
			image: profile.image
		}
	})

	const onSubmit = async (data: UpdateUserProfileInput) => {
		// Handle form submission logic here
		return data
	}

	useEffect(() => {
		if (profile?.image) {
			setPreview(profile.image)
		}
	}, [profile?.image, setPreview])

	useEffect(() => {
		form.reset({
			name: profile.name,
			image: profile.image
		})
	}, [form, profile])

	return (
		<Card className="w-full px-8 py-10 gap-8 rounded-xl">
			<CardHeader className="w-full">
				<CardTitle>
					<h1 className="text-2xl text-left font-bold text-foreground">
						Profile Information
					</h1>
				</CardTitle>
				<CardDescription className="text-sm text-left font-medium text-muted-foreground">
					Manage your account information.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form id="form-profile" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup className="gap-4">
						<span className="text-foreground font-medium text-sm">
							Profile picture
						</span>
						<div className="flex items-center justify-center w-full p-2">
							<ImageUpload
								onFileSelected={handleFileSelect}
								clearSelection={clearSelection}
								preview={preview}
							/>
						</div>

						<Field className="gap-1.5">
							<FieldLabel htmlFor="email" className="text-foreground">
								Email address
							</FieldLabel>
							<Input
								value={profile.email}
								id="email"
								type="email"
								readOnly
								disabled
								className="hover:bg-secondary focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring/60"
							/>
						</Field>

						<Controller
							control={form.control}
							name="name"
							render={({ field, fieldState }) => (
								<Field className="gap-1.5" data-invalid={false}>
									<FieldLabel htmlFor="name" className="text-foreground">
										Full name
									</FieldLabel>
									<Input
										{...field}
										id="name"
										type="text"
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
					</FieldGroup>

					<div className="flex justify-end mt-8">
						<Button
							type="submit"
							className="w-fit h-11.5 rounded-lg hover:bg-chart-3 cursor-pointer font-semibold"
							// disabled={isPending}
						>
							Save Changes
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}
