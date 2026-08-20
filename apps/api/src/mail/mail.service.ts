import { Injectable } from '@nestjs/common'
import {
	type ISendMailOptions,
	MailerQueueService
} from '@nestjs-modules/mailer'

@Injectable()
export class MailService {
	constructor(private readonly queueService: MailerQueueService) {}

	async sendMail(mailOptions: ISendMailOptions): Promise<void> {
		await this.queueService.enqueue(mailOptions)
	}
}
