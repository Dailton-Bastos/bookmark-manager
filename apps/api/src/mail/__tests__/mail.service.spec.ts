import { Test, TestingModule } from '@nestjs/testing'
import { MailerQueueService } from '@nestjs-modules/mailer'
import { CacheProvider } from '../../cache/cache.provider'
import { EMAIL_VERIFICATION_CACHE_KEY } from '../../shared/constants/cache'
import { MailService } from '../mail.service'
import { mockUser } from './__mocks__/user-mail.mock'

describe('MailService', () => {
	let service: MailService
	let queueService: MailerQueueService
	let cacheProvider: CacheProvider

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MailService,
				{
					provide: MailerQueueService,
					useValue: {
						enqueue: jest.fn()
					}
				},
				{
					provide: CacheProvider,
					useValue: {
						get: jest.fn(),
						set: jest.fn()
					}
				}
			]
		}).compile()

		service = module.get<MailService>(MailService)
		queueService = module.get<MailerQueueService>(MailerQueueService)
		cacheProvider = module.get<CacheProvider>(CacheProvider)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
		expect(queueService).toBeDefined()
		expect(cacheProvider).toBeDefined()
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

	describe('sendOnPasswordResetConfirmationEmail', () => {
		it('should call sendMail with correct parameters', async () => {
			const { email, name } = mockUser
			const requestPasswordResetUrl =
				'http://example.com/request-password-reset'

			const sendMailSpy = jest.spyOn(service, 'sendMail')

			await service.sendOnPasswordResetConfirmationEmail({
				user: mockUser,
				requestPasswordResetUrl
			})

			expect(sendMailSpy).toHaveBeenCalledWith({
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
		})

		it('should propagate errors thrown by sendMail', async () => {
			const requestPasswordResetUrl =
				'http://example.com/request-password-reset'

			jest
				.spyOn(service, 'sendMail')
				.mockRejectedValue(new Error('Send mail failed'))

			await expect(
				service.sendOnPasswordResetConfirmationEmail({
					user: mockUser,
					requestPasswordResetUrl
				})
			).rejects.toThrow('Send mail failed')
		})
	})

	describe('sendVerificationEmail', () => {
		it('should call sendMail with correct parameters', async () => {
			const { email, name } = mockUser
			const url = 'http://example.com/verify-email'

			const sendMailSpy = jest.spyOn(service, 'sendMail')

			await service.sendVerificationEmail({ user: mockUser, url })

			expect(sendMailSpy).toHaveBeenCalledWith({
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

			expect(cacheProvider.set).toHaveBeenCalledWith(
				`${EMAIL_VERIFICATION_CACHE_KEY}_${email}`,
				email,
				900_000
			)
		})

		it('should propagate errors thrown by sendMail', async () => {
			const url = 'http://example.com/verify-email'

			jest
				.spyOn(service, 'sendMail')
				.mockRejectedValue(new Error('Send mail failed'))

			await expect(
				service.sendVerificationEmail({ user: mockUser, url })
			).rejects.toThrow('Send mail failed')
		})

		it('should not send email if verification request is cached', async () => {
			const { email } = mockUser
			const url = 'http://example.com/verify-email'

			jest.spyOn(cacheProvider, 'get').mockResolvedValue(email)

			const sendMailSpy = jest.spyOn(service, 'sendMail')

			await service.sendVerificationEmail({ user: mockUser, url })

			expect(sendMailSpy).not.toHaveBeenCalled()
		})
	})
})
