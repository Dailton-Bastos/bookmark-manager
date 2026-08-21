import { existsSync } from 'node:fs'
import path from 'node:path'
import { Global, Module } from '@nestjs/common'
import { MailerModule, MailerQueueModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter'
import Redis from 'ioredis'
import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { RedisModule } from '../redis/redis.module'
import { REDIS_CLIENT } from '../shared/constants/redis'
import { MailService } from './mail.service'

const templateDir =
	[
		path.resolve(process.cwd(), 'dist/templates'),
		path.resolve(process.cwd(), 'src/templates'),
		path.join(__dirname, '..', 'templates'),
		path.join(__dirname, 'templates')
	].find((dir) => existsSync(dir)) ??
	path.resolve(process.cwd(), 'dist/templates')

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
				template: {
					dir: templateDir,
					adapter: new HandlebarsAdapter(),
					options: {
						strict: true
					}
				},
				options: {
					partials: {
						dir: path.join(templateDir, 'partials'),
						options: {
							strict: true
						}
					}
				},
				defaults: {
					from: envService.get('MAIL_FROM')
				},
				verifyTransporters: true,
				preview: envService.get('NODE_ENV') === 'development'
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
