import { getSessionCookie } from 'better-auth/cookies'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { authRoutes, DEFAULT_LOGIN_REDIRECT } from './routes'

export function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl

	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

	const sessionCookie = getSessionCookie(request)

	if (isAuthRoute) {
		if (sessionCookie) {
			return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url))
		}

		return NextResponse.next()
	}

	if (!sessionCookie) {
		let callbackUrl = pathname

		if (search) {
			callbackUrl += search
		}

		const encodedCallbackUrl = encodeURIComponent(callbackUrl)

		const loginUrl = new URL(
			`/login?callbackUrl=${encodedCallbackUrl}`,
			request.url
		)

		return NextResponse.redirect(loginUrl)
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
}
