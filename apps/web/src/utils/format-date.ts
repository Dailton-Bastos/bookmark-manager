export const formatDate = (dateString: string): string => {
	const date = new Date(dateString)

	const formatter = new Intl.DateTimeFormat('en-GB', {
		month: 'short',
		day: 'numeric'
	})

	return formatter.format(date)
}
