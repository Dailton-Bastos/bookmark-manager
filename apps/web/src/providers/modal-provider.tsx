import React from 'react'
import { AddBookmarkModal } from '@/components/bookmark/add-bookmark-modal'
import { ArchiveUnarchiveBookmarkModal } from '@/components/bookmark/archive-unarchive-bookmark-modal'
import { DeleteBookmarkModal } from '@/components/bookmark/delete-bookmark-modal'
import { UpdateBookmarkModal } from '@/components/bookmark/update-bookmark-modal'

export const ModalProvider = () => {
	return (
		<React.Fragment>
			<AddBookmarkModal />
			<ArchiveUnarchiveBookmarkModal />
			<DeleteBookmarkModal />
			<UpdateBookmarkModal />
		</React.Fragment>
	)
}
