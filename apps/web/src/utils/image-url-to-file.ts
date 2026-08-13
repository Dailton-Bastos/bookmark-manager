import { MAX_BOOKMARK_LOGO_SIZE } from './constants'

export const imageUrlToFile = async (
	imageUrl: string
): Promise<File | null> => {
	try {
		const response = await fetch(imageUrl)

		if (!response.ok) return null

		const blob = await response.blob()

		if (blob.size > MAX_BOOKMARK_LOGO_SIZE) return null

		const extensionByType: Record<string, string> = {
			'image/jpeg': 'jpg',
			'image/jpg': 'jpg',
			'image/png': 'png',
			'image/webp': 'webp'
		}

		const extension = extensionByType[blob.type]

		if (!extension) return null

		const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`

		return new File([blob], fileName, { type: blob.type })
	} catch {
		return null
	}
}
