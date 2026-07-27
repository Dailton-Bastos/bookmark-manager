import { Controller } from '@nestjs/common'
import { Implement, implement, ORPCError } from '@orpc/nest'
import { contract } from '@repo/contract'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'
import { BookmarksService } from './bookmarks.service'

@Controller()
export class BookmarksController {
	constructor(private readonly bookmarksService: BookmarksService) {}

	@Implement(contract.bookmark.create)
	create(@Session() session: UserSession) {
		return implement(contract.bookmark.create).handler(async ({ input }) => {
			const bookmark = await this.bookmarksService.create(
				input,
				session.user.id
			)

			if (!bookmark) {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: 'Failed to create bookmark'
				})
			}

			return bookmark
		})
	}

	@Implement(contract.bookmark.list)
	list(@Session() session: UserSession) {
		return implement(contract.bookmark.list).handler(async ({ input }) => {
			const bookmarks = await this.bookmarksService.list(input, session.user.id)

			return bookmarks
		})
	}

	@Implement(contract.bookmark.archiveOrUnarchive)
	archiveOrUnarchive(@Session() session: UserSession) {
		return implement(contract.bookmark.archiveOrUnarchive).handler(
			async ({ input }) => {
				const bookmark = await this.bookmarksService.archiveOrUnarchive(
					input,
					session.user.id
				)

				if (!bookmark) {
					throw new ORPCError('NOT_FOUND', {
						message: 'Bookmark not found or not accessible'
					})
				}

				return bookmark
			}
		)
	}

	@Implement(contract.bookmark.pinOrUnpin)
	pinOrUnpin(@Session() session: UserSession) {
		return implement(contract.bookmark.pinOrUnpin).handler(
			async ({ input }) => {
				const bookmark = await this.bookmarksService.pinOrUnpin(
					input,
					session.user.id
				)

				if (!bookmark) {
					throw new ORPCError('NOT_FOUND', {
						message: 'Bookmark not found or not accessible'
					})
				}

				return bookmark
			}
		)
	}

	@Implement(contract.bookmark.visited)
	visited(@Session() session: UserSession) {
		return implement(contract.bookmark.visited).handler(async ({ input }) => {
			const bookmark = await this.bookmarksService.visited(
				input,
				session.user.id
			)

			if (!bookmark) {
				throw new ORPCError('NOT_FOUND', {
					message: 'Bookmark not found or not accessible'
				})
			}

			return bookmark
		})
	}

	@Implement(contract.bookmark.delete)
	delete(@Session() session: UserSession) {
		return implement(contract.bookmark.delete).handler(async ({ input }) => {
			const result = await this.bookmarksService.delete(input, session.user.id)

			if (result === null) {
				throw new ORPCError('NOT_FOUND', {
					message: 'Bookmark not found or not accessible'
				})
			}

			return { success: true }
		})
	}

	@Implement(contract.bookmark.update)
	update(@Session() session: UserSession) {
		return implement(contract.bookmark.update).handler(async ({ input }) => {
			const bookmark = await this.bookmarksService.update(
				input,
				session.user.id
			)

			if (!bookmark) {
				throw new ORPCError('NOT_FOUND', {
					message: 'Bookmark not found or not accessible'
				})
			}

			return bookmark
		})
	}

	@Implement(contract.bookmark.search)
	search(@Session() session: UserSession) {
		return implement(contract.bookmark.search).handler(async ({ input }) => {
			const bookmarks = await this.bookmarksService.search(
				input,
				session.user.id
			)

			return bookmarks
		})
	}

	@Implement(contract.bookmark.tagged)
	tagged(@Session() session: UserSession) {
		return implement(contract.bookmark.tagged).handler(async ({ input }) => {
			const bookmarks = await this.bookmarksService.listByTags(
				input,
				session.user.id
			)

			return bookmarks
		})
	}

	@Implement(contract.bookmark.metadata)
	metadata() {
		return implement(contract.bookmark.metadata).handler(async ({ input }) => {
			const metadata = await this.bookmarksService.getUrlMetadata(input.url)

			if (!metadata) {
				throw new ORPCError('NOT_FOUND', {
					message: 'Metadata not found for the provided URL'
				})
			}

			return metadata
		})
	}
}
