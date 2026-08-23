const uiUrl = process.env.NEXT_PUBLIC_UI_URL

if (!uiUrl) {
	throw new Error('Missing required environment variable: NEXT_PUBLIC_UI_URL')
}

export const EMAIL_VERIFICATION_CALLBACK_URL = new URL(
	'/email-verification',
	uiUrl
).toString()
