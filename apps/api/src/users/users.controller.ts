import { Controller, Headers } from '@nestjs/common'
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

	@Implement(contract.user.updateProfile)
	updateProfile(@Session() session: UserSession) {
		return implement(contract.user.updateProfile).handler(async ({ input }) => {
			const updatedUser = await this.usersService.updateProfile(
				session.user.id,
				input
			)

			if (!updatedUser) {
				throw new ORPCError('NOT_FOUND', {
					message: 'User profile not found for the provided ID'
				})
			}

			return updatedUser
		})
	}

	@Implement(contract.user.updatePassword)
	updatePassword(
		@Session() session: UserSession,
		@Headers() headers: Record<string, string>
	) {
		return implement(contract.user.updatePassword).handler(
			async ({ input }) => {
				await this.usersService.updatePassword(session.user.id, input, headers)
			}
		)
	}
}
