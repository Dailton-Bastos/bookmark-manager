import React from 'react'
import { AddBookmarkModal } from '@/components/bookmark/add-bookmark-modal'
import { ArchiveUnarchiveBookmarkModal } from '@/components/bookmark/archive-unarchive-bookmark-modal'

export const ModalProvider = () => {
	return (
		<React.Fragment>
			<AddBookmarkModal />
			<ArchiveUnarchiveBookmarkModal />
		</React.Fragment>
	)
}
