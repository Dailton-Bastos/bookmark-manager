import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from 'ui/components/shadcn/ui/button'
import { CardWrapper } from '@/components/auth/card-wrapper'
import { FormSkeleton } from '@/components/auth/form-skeleton'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export default async function ResetPasswordPage({
	searchParams
}: {
	searchParams: Promise<{ token?: string }>
}) {
	const { token } = await searchParams

	if (!token) {
		return (
			<div className="max-w-md w-full space-y-8">
				<CardWrapper
					headerTitle="Invalid or expired link"
					headerDescription="The password reset link is invalid or has expired. Please request a new password reset."
				>
					<div className="w-full">
						<Button
							type="button"
							className="w-full h-11.5 rounded-lg hover:bg-chart-3 cursor-pointer font-semibold"
							asChild
						>
							<Link href="/request-password-reset">
								Request a new password reset
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
				<ResetPasswordForm token={token} />
			</Suspense>
		</div>
	)
}
