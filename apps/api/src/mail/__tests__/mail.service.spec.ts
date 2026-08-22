import { Test, TestingModule } from '@nestjs/testing'
import { MailerQueueService } from '@nestjs-modules/mailer'
import { CacheProvider } from '../../cache/cache.provider'
import { RESET_PASSWORD_CACHE_KEY } from '../../shared/constants/cache'
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
						del: jest.fn()
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

		it('should call cacheProvider.del if sendMail throws an error', async () => {
			const { email } = mockUser
			const url = 'http://example.com/reset-password'

			jest.spyOn(service, 'sendMail').mockImplementation(() => {
				throw new Error('Send mail failed')
			})

			const cacheDelSpy = jest.spyOn(cacheProvider, 'del')

			await expect(
				service.sendResetPasswordEmail({ user: mockUser, url })
			).rejects.toThrow('Send mail failed')

			expect(cacheDelSpy).toHaveBeenCalledWith(
				`${RESET_PASSWORD_CACHE_KEY}_${email}`
			)
		})

		it('should throw an error if cacheProvider.del throws an error', async () => {
			const url = 'http://example.com/reset-password'

			// Mock sendMail to throw an error
			jest.spyOn(service, 'sendMail').mockImplementation(() => {
				throw new Error('Send mail failed')
			})

			// Mock cacheProvider.del to throw an error
			jest.spyOn(cacheProvider, 'del').mockImplementation(() => {
				throw new Error('Cache delete failed')
			})

			await expect(
				service.sendResetPasswordEmail({ user: mockUser, url })
			).rejects.toThrow('Cache delete failed')
		})

		it('should throw an error if sendMail throws a non-Error', async () => {
			const url = 'http://example.com/reset-password'

			// Mock sendMail to throw a non-Error
			jest.spyOn(service, 'sendMail').mockImplementation(() => {
				throw 'Send mail failed'
			})

			await expect(
				service.sendResetPasswordEmail({ user: mockUser, url })
			).rejects.toThrow('Send mail failed')
		})

		it('should throw an error if cacheProvider.del throws a non-Error', async () => {
			const url = 'http://example.com/reset-password'

			// Mock sendMail to throw an error
			jest.spyOn(service, 'sendMail').mockImplementation(() => {
				throw new Error('Send mail failed')
			})

			// Mock cacheProvider.del to throw a non-Error
			jest.spyOn(cacheProvider, 'del').mockImplementation(() => {
				throw 'Cache delete failed'
			})

			await expect(
				service.sendResetPasswordEmail({ user: mockUser, url })
			).rejects.toThrow('Cache delete failed')
		})
	})
})
