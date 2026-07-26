export const getImageUrl = (imagePath: string) => {
	if (!imagePath) {
		return null
	}

	const API_URL = process.env.NEXT_PUBLIC_API_URL

	return `${API_URL}${imagePath}`
}
