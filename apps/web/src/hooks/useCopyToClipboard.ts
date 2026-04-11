import { useState } from 'react'

interface CopyFnParams {
	text: string
}

type CopyFn = (params: CopyFnParams) => void
type Result = null | { state: 'success' | 'error'; message: string }

export const useCopyToClipboard = (): [CopyFn, Result] => {
	const [result, setResult] = useState<Result>(null)

	const copyToClipboard = async ({ text }: CopyFnParams): Promise<void> => {
		if (!navigator.clipboard) {
			setResult({ state: 'error', message: 'Clipboard API not supported' })
			return
		}

		try {
			await navigator.clipboard.writeText(text)
			setResult({ state: 'success', message: 'Copied to clipboard' })
		} catch {
			setResult({ state: 'error', message: 'Failed to copy to clipboard' })
		} finally {
			setTimeout(() => setResult(null), 2000) // Clear message after 2 seconds
		}
	}

	return [copyToClipboard, result]
}
