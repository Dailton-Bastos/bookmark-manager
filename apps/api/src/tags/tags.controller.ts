import { Controller } from '@nestjs/common'
import { Implement, implement } from '@orpc/nest'
import { contract } from '@repo/contract'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'
import { TagsService } from './tags.service'

@Controller()
export class TagsController {
	constructor(private readonly tagsService: TagsService) {}

	@Implement(contract.tag.list)
	list(@Session() session: UserSession) {
		return implement(contract.tag.list).handler(async ({ input }) => {
			return this.tagsService.list(input, session.user.id)
		})
	}
}
