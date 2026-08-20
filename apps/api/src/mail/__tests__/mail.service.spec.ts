import { Test, TestingModule } from '@nestjs/testing'
import { MailerQueueService } from '@nestjs-modules/mailer'
import { MailService } from '../mail.service'

describe('MailService', () => {
	let service: MailService
	let mailerQueueService: MailerQueueService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MailService,
				{
					provide: MailerQueueService,
					useValue: {
						enqueue: jest.fn()
					}
				}
			]
		}).compile()

		service = module.get<MailService>(MailService)
		mailerQueueService = module.get<MailerQueueService>(MailerQueueService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
		expect(mailerQueueService).toBeDefined()
	})

	describe('sendMail', () => {
		it('should call enqueue method of MailerQueueService with correct parameters', async () => {
			const mailOptions = {
				to: 'test@example.com',
				subject: 'Test Subject',
				text: 'Test Body'
			}

			await service.sendMail(mailOptions)

			expect(mailerQueueService.enqueue).toHaveBeenCalledWith(mailOptions)
		})
	})
})
