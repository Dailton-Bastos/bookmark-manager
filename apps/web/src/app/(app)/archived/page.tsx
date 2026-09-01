import type { Metadata } from 'next'
import { ArchivedBookmarks } from '../_components/archived-bookmarks'

export const metadata: Metadata = {
	title: 'Archived Bookmarks'
}

const ArchivedBookmarksPage = () => {
	return <ArchivedBookmarks />
}

export default ArchivedBookmarksPage
