import { MAX_BOOKMARK_LOGO_SIZE } from './constants'

export const imageUrlToFile = async (
	imageUrl: string
): Promise<File | null> => {
	try {
		const response = await fetch(imageUrl)
		const blob = await response.blob()

		if (blob.size > MAX_BOOKMARK_LOGO_SIZE) return null

		const allowedTypes = new Set([
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/webp'
		])

		if (!allowedTypes.has(blob.type)) return null

		const contentType = blob.type

		const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`

		return new File([blob], fileName, { type: contentType })
	} catch {
		return null
	}
}
