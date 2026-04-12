import { Controller } from '@nestjs/common'
import { Implement, implement, ORPCError } from '@orpc/nest'
import { contract } from '@repo/contract'
import { BookmarksService } from './bookmarks.service'

@Controller()
export class BookmarksController {
	constructor(private readonly bookmarksService: BookmarksService) {}

	@Implement(contract.bookmark.create)
	create() {
		return implement(contract.bookmark.create).handler(async ({ input }) => {
			const bookmark = await this.bookmarksService.create(input)

			if (!bookmark) {
				throw new ORPCError('INTERNAL_SERVER_ERROR', {
					message: 'Failed to create bookmark'
				})
			}

			return bookmark
		})
	}
}
