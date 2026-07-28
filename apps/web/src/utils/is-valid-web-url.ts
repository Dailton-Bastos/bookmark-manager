export const isValidWebUrl = (url: string): boolean => {
	try {
		const parsedUrl = new URL(url)
		return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
	} catch {
		return false
	}
}
