import { oc } from '@orpc/contract'
import {
	requestPasswordResetSchema,
	resetPasswordSchema,
	updateUserPasswordSchema,
	updateUserProfileSchema,
	userProfileSchema
} from '@repo/schemas'

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

export const updateUserPasswordContract = oc
	.route({
		method: 'PATCH',
		path: '/user/password',
		summary: 'Update user password',
		tags: ['User']
	})
	.input(updateUserPasswordSchema)

export const requestPasswordResetContract = oc
	.route({
		method: 'POST',
		path: '/user/request-password-reset',
		summary: 'Request password reset',
		tags: ['Auth']
	})
	.input(requestPasswordResetSchema)

export const resetPasswordContract = oc
	.route({
		method: 'POST',
		path: '/user/reset-password',
		summary: 'Reset user password',
		tags: ['Auth']
	})
	.input(resetPasswordSchema)
