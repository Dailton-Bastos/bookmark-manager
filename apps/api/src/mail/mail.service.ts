import { Injectable } from '@nestjs/common'
import {
	type ISendMailOptions,
	MailerQueueService
} from '@nestjs-modules/mailer'
import type { BaseUserSession } from '@thallesp/nestjs-better-auth'
import { CacheProvider } from '../cache/cache.provider'
import { EMAIL_VERIFICATION_CACHE_KEY } from '../shared/constants/cache'

@Injectable()
export class MailService {
	constructor(
		private readonly queueService: MailerQueueService,
		private readonly cacheProvider: CacheProvider
	) {}

	async sendMail(mailOptions: ISendMailOptions): Promise<void> {
		await this.queueService.enqueue(mailOptions)
	}

	async sendResetPasswordEmail({
		user: { email, name },
		url
	}: {
		user: BaseUserSession['user']
		url: string
	}): Promise<void> {
		await this.sendMail({
			to: email,
			subject: 'Reset your password',
			template: 'reset-password',
			context: {
				url,
				name,
				previewText: 'Click the link below to reset your password.',
				title: 'Reset your password'
			}
		})
	}

	async sendOnPasswordResetConfirmationEmail({
		user: { email, name },
		requestPasswordResetUrl
	}: {
		user: BaseUserSession['user']
		requestPasswordResetUrl: string
	}): Promise<void> {
		await this.sendMail({
			to: email,
			subject: 'Your password has been reset',
			template: 'password-reset-confirmation',
			context: {
				name,
				previewText:
					'Your password has been successfully reset. If you did not initiate this change, please contact support immediately.',
				title: 'Password Reset Confirmation',
				requestPasswordResetUrl
			}
		})
	}

	async sendVerificationEmail({
		user: { email, name },
		url
	}: {
		user: BaseUserSession['user']
		url: string
	}): Promise<void> {
		const cacheKey = `${EMAIL_VERIFICATION_CACHE_KEY}_${email}`
		const ttl = 900_000 // Cache for 15 minutes in milliseconds

		// Check if the email verification request is already cached
		const cachedRequest = await this.cacheProvider.get<string>(cacheKey)

		if (cachedRequest) return // Email verification request already sent, no need to send again

		// Send the verification email
		await this.sendMail({
			to: email,
			subject: 'Verify your email address',
			template: 'verify-email',
			context: {
				url,
				name,
				previewText:
					'Click the link below to verify your email address and complete your registration.',
				title: 'Verify your email address'
			}
		})

		// Cache the email for future requests
		await this.cacheProvider.set<string>(cacheKey, email, ttl)
	}
}
