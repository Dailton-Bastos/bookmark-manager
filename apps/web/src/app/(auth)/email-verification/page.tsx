import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from 'ui/components/shadcn/ui/button'
import { FieldDescription } from 'ui/components/shadcn/ui/field'
import { CardWrapper } from '@/components/auth/card-wrapper'
import { FormSkeleton } from '@/components/auth/form-skeleton'

export const metadata: Metadata = {
	title: 'Email Verification'
}

export default async function EmailVerificationPage({
	searchParams
}: {
	searchParams: Promise<{ error?: string }>
}) {
	const { error } = await searchParams

	if (error) {
		return (
			<div className="max-w-md w-full space-y-8">
				<CardWrapper
					headerTitle="Invalid or expired link"
					headerDescription="The email verification link is invalid or has expired. Please request a new email verification."
				>
					<div className="w-full">
						<Button
							type="button"
							className="w-full h-11.5 rounded-lg hover:bg-chart-3 cursor-pointer font-semibold"
							asChild
						>
							<Link href="/request-email-verification">
								Request a new email verification
							</Link>
						</Button>

						<div className="flex flex-col gap-3 w-full mt-8">
							<div className="text-center font-medium [&>a]:no-underline">
								<Link
									href="/login"
									className="font-semibold text-sm text-foreground outline-none focus-visible:p-0.5 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
								>
									Back to login
								</Link>
							</div>
						</div>
					</div>
				</CardWrapper>
			</div>
		)
	}

	return (
		<div className="max-w-md w-full space-y-8">
			<Suspense fallback={<FormSkeleton />}>
				<CardWrapper
					headerTitle="Email verification"
					headerDescription="Your email has been successfully verified. You can now log in to your account."
				>
					<div className="w-full">
						<Button
							type="button"
							className="w-full h-11.5 rounded-lg hover:bg-chart-3 cursor-pointer font-semibold"
							asChild
						>
							<Link href="/login">Login to your account</Link>
						</Button>

						<div className="flex flex-col gap-3 w-full mt-8">
							<FieldDescription className="text-center font-medium [&>a]:no-underline">
								Forgot password?{' '}
								<Link
									href="/request-password-reset"
									className="font-semibold text-sm text-foreground outline-none focus-visible:p-0.5 focus-visible:rounded  focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
								>
									Reset it
								</Link>
							</FieldDescription>
						</div>
					</div>
				</CardWrapper>
			</Suspense>
		</div>
	)
}
