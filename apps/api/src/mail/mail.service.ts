import { Injectable } from '@nestjs/common'
import {
	type ISendMailOptions,
	MailerQueueService
} from '@nestjs-modules/mailer'
import type { BaseUserSession } from '@thallesp/nestjs-better-auth'
import { CacheProvider } from '../cache/cache.provider'
import { RESET_PASSWORD_CACHE_KEY } from '../shared/constants/cache'

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
		const cacheKey = `${RESET_PASSWORD_CACHE_KEY}_${email}`

		try {
			await this.sendMail({
				to: email,
				subject: 'Reset your password',
				template: 'reset-password',
				context: {
					url,
					name: name ?? email,
					previewText: 'Click the link below to reset your password.',
					title: 'Reset your password'
				}
			})
		} catch (sendMailError) {
			// If sending the email fails, we should still invalidate the cache to prevent abuse
			try {
				await this.cacheProvider.del(cacheKey)
			} catch (error) {
				throw new Error(error instanceof Error ? error.message : String(error))
			}

			throw new Error(
				sendMailError instanceof Error
					? sendMailError.message
					: String(sendMailError)
			)
		}
	}
}
