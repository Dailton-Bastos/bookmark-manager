import { Global, Module } from '@nestjs/common'
import { MailerModule, MailerQueueModule } from '@nestjs-modules/mailer'
import Redis from 'ioredis'
import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { RedisModule } from '../redis/redis.module'
import { REDIS_CLIENT } from '../shared/constants/redis'
import { MailService } from './mail.service'

@Global()
@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [EnvModule],
			useFactory: (envService: EnvService) => ({
				transport: {
					host: envService.get('MAIL_HOST'),
					port: envService.get('MAIL_PORT'),
					secure: envService.get('MAIL_PORT') === 465, // true for 465, false for other ports
					auth: {
						user: envService.get('MAIL_USER'),
						pass: envService.get('MAIL_PASSWORD')
					}
				},
				defaults: {
					from: envService.get('MAIL_FROM')
				}
			}),
			inject: [EnvService]
		}),
		MailerQueueModule.registerAsync({
			imports: [RedisModule],
			useFactory: (redisClient: Redis) => ({
				connection: redisClient,
				global: true,
				defaultJobOptions: {
					attempts: 3,
					backoff: {
						type: 'exponential',
						delay: 1000
					},
					removeOnComplete: 100,
					removeOnFail: 500
				}
			}),
			inject: [REDIS_CLIENT]
		})
	],
	providers: [MailService],
	exports: [MailService]
})
export class MailModule {}
