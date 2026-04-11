export const formatDate = (dateString: string): string => {
	const date = new Date(dateString)

	if (Number.isNaN(date.getTime())) return ''

	const formatter = new Intl.DateTimeFormat('en-GB', {
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC'
	})

	return formatter.format(date)
}
