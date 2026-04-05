import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

export const getSafeCallbackUrl = (callbackUrl: string | undefined): string => {
	if (!callbackUrl) return DEFAULT_LOGIN_REDIRECT

	try {
		const decoded = decodeURIComponent(callbackUrl)

		if (decoded.startsWith('/') && !decoded.startsWith('//')) {
			return decoded
		}
	} catch {
		// decodeURIComponent failed; fall through to default
	}

	return DEFAULT_LOGIN_REDIRECT
}
