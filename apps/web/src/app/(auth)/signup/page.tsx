import type { Metadata } from 'next'
import { Signup } from '../_components/signup'

export const metadata: Metadata = {
	title: 'Sign Up'
}

export default function SignupPage() {
	return (
		<div className="max-w-md w-full space-y-8">
			<Signup />
		</div>
	)
}
