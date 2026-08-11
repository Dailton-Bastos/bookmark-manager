'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { type RefObject, useCallback, useRef } from 'react'
import { orpcClient } from '@/lib/orpc-client'
import { imageUrlToFile } from '@/utils/image-url-to-file'
import { isValidWebUrl } from '@/utils/is-valid-web-url'

interface UseBookmarkMetadataParams {
	url: string
	initialBookmarkUrlRef: RefObject<string | null> | null
	enabled?: boolean
}

export const useBookmarkMetadata = ({
	url,
	initialBookmarkUrlRef = null,
	enabled = false
}: UseBookmarkMetadataParams) => {
	const { theme } = useTheme()

	const lastFetchedMetadataUrlRef = useRef<string | null>(null)

	// Ensure theme is either 'light' or 'dark'
	const currentTheme =
		theme === 'system' ? 'light' : (theme as 'light' | 'dark')

	const { bookmark } = orpcClient

	const { mutateAsync } = useMutation(bookmark.metadata.mutationOptions())

	const fetchBookmarkMetadata = useCallback(async () => {
		if (!isValidWebUrl(url)) {
			lastFetchedMetadataUrlRef.current = null
			return null
		}

		// Do not overwrite values when opening an existing bookmark without URL edits.
		if (initialBookmarkUrlRef && url === initialBookmarkUrlRef.current)
			return null

		lastFetchedMetadataUrlRef.current = url

		try {
			const metadata = await mutateAsync({ url, theme: currentTheme })

			if (!metadata.favicon) return { ...metadata, favicon: null }

			const favicon = await imageUrlToFile(metadata.favicon)

			return { ...metadata, favicon }
		} catch {
			lastFetchedMetadataUrlRef.current = null
			return null
		}
	}, [url, initialBookmarkUrlRef, mutateAsync, currentTheme])

	const result = useQuery({
		queryKey: ['bookmarkMetadata', url, currentTheme],
		queryFn: fetchBookmarkMetadata,
		enabled
	})

	return result
}
