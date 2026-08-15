import { oc } from '@orpc/contract'
import { updateUserProfileSchema, userProfileSchema } from '@repo/schemas'

export const getUserProfileContract = oc
	.route({
		method: 'GET',
		path: '/user/profile',
		summary: 'Get user profile',
		tags: ['User']
	})
	.output(userProfileSchema)

export const updateUserProfileContract = oc
	.route({
		method: 'PATCH',
		path: '/user/profile',
		summary: 'Update user profile',
		tags: ['User']
	})
	.input(updateUserProfileSchema)
	.output(userProfileSchema)
