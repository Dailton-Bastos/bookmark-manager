import { Controller } from '@nestjs/common'
import { Implement, implement, ORPCError } from '@orpc/nest'
import { contract } from '@repo/contract'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'
import { UsersService } from './users.service'

@Controller()
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Implement(contract.user.getProfile)
	getProfile(@Session() session: UserSession) {
		return implement(contract.user.getProfile).handler(async () => {
			const user = await this.usersService.getProfile(session.user.id)

			if (!user) {
				throw new ORPCError('NOT_FOUND', {
					message: 'User profile not found for the provided ID'
				})
			}

			return user
		})
	}
}
