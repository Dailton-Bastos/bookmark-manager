import { Injectable } from '@nestjs/common'
import {
	type ISendMailOptions,
	MailerQueueService
} from '@nestjs-modules/mailer'
import type { BaseUserSession } from '@thallesp/nestjs-better-auth'

@Injectable()
export class MailService {
	constructor(private readonly queueService: MailerQueueService) {}

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
}
