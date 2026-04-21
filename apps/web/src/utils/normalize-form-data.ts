export const normalizeFormData = <T extends Record<string, unknown>>(
	formData: T
): T => {
	const normalizedData: Record<string, unknown> = {}

	for (const [key, value] of Object.entries(formData)) {
		if (typeof value === 'string') {
			normalizedData[key] = value.trim()
		} else {
			normalizedData[key] = value
		}
	}

	return normalizedData as T
}
