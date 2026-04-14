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
}
