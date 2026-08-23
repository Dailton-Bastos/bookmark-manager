const uiUrl = process.env.NEXT_PUBLIC_UI_URL

if (!uiUrl) {
	throw new Error('Missing required environment variable: NEXT_PUBLIC_UI_URL')
}

export const MAX_BOOKMARK_TAGS = 10
export const DEFAULT_TAGS_LIMIT = 15
export const MAX_BOOKMARK_LOGO_SIZE = 5 * 1024 * 1024 // 5MB
export const EMAIL_VERIFICATION_CALLBACK_URL = new URL(
	'/email-verification',
	uiUrl
).toString()
