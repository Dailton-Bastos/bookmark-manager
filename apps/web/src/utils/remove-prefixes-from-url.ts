export const removePrefixesFromUrl = (url: string): string => {
	const regex = /^(https?:\/\/)?(www\.)?/i

	return url.replace(regex, '')
}
