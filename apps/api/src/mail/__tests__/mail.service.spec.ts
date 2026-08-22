import { Test, TestingModule } from '@nestjs/testing'
import { MailerQueueService } from '@nestjs-modules/mailer'
import { MailService } from '../mail.service'
import { mockUser } from './__mocks__/user-mail.mock'

describe('MailService', () => {
	let service: MailService
	let queueService: MailerQueueService

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
		queueService = module.get<MailerQueueService>(MailerQueueService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
		expect(queueService).toBeDefined()
	})

	describe('sendMail', () => {
		it('should call enqueue method of MailerQueueService with correct parameters', async () => {
			const mailOptions = {
				to: 'test@example.com',
				subject: 'Test Subject',
				text: 'Test Body'
			}

			await service.sendMail(mailOptions)

			expect(queueService.enqueue).toHaveBeenCalledWith(mailOptions)
		})
	})

	describe('sendResetPasswordEmail', () => {
		it('should call sendMail with correct parameters', async () => {
			const { email, name } = mockUser
			const url = 'http://example.com/reset-password'

			const sendMailSpy = jest.spyOn(service, 'sendMail')

			await service.sendResetPasswordEmail({ user: mockUser, url })

			expect(sendMailSpy).toHaveBeenCalledWith({
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
		})

		it('should propagate errors thrown by sendMail', async () => {
			const url = 'http://example.com/reset-password'

			jest
				.spyOn(service, 'sendMail')
				.mockRejectedValue(new Error('Send mail failed'))

			await expect(
				service.sendResetPasswordEmail({ user: mockUser, url })
			).rejects.toThrow('Send mail failed')
		})
	})
})
