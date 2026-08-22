import KeyvRedis from '@keyv/redis'
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager'
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ORPCError, ORPCModule, onError } from '@orpc/nest'
import { ValidationError } from '@orpc/server'
import { experimental_RethrowHandlerPlugin as RethrowHandlerPlugin } from '@orpc/server/plugins'
import { AuthModule } from '@thallesp/nestjs-better-auth'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { KeyvCacheableMemory } from 'cacheable'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { Request } from 'express'
import { Keyv } from 'keyv'
import z from 'zod'
import { BookmarksModule } from './bookmarks/bookmarks.module'
import { CacheModule } from './cache/cache.module'
import { CacheProvider } from './cache/cache.provider'
import { validate } from './config/env.config'
import { RequestContextMiddleware } from './core/request-context.middleware'
import { DatabaseModule } from './database/database.module'
import { EnvModule } from './env/env.module'
import { EnvService } from './env/env.service'
import { HealthModule } from './health/health.module'
import { MailModule } from './mail/mail.module'
import { MailService } from './mail/mail.service'
import { PaginationModule } from './pagination/pagination.module'
import { RedisModule } from './redis/redis.module'
import { RESET_PASSWORD_CACHE_KEY } from './shared/constants/cache'
import { DATABASE_CONNECTION } from './shared/constants/database'
import { requestContextStorage } from './shared/request-context'
import { TagsModule } from './tags/tags.module'
import { UploadModule } from './upload/upload.module'
import { UsersModule } from './users/users.module'

declare module '@orpc/nest' {
	/**
	 * Extend oRPC global context to make it type-safe inside handlers/middlewares
	 */
	interface ORPCGlobalContext {
		request: Request
	}
}

const logger = new Logger('oRPC')

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			expandVariables: true,
			validate
		}),
		NestCacheModule.registerAsync({
			isGlobal: true,
			imports: [EnvModule],
			useFactory: async (envService: EnvService) => {
				return {
					stores: [
						new Keyv({
							store: new KeyvCacheableMemory({
								ttl: envService.get('CACHE_TTL')
							})
						}),
						new KeyvRedis(envService.get('REDIS_URL'))
					]
				}
			},
			inject: [EnvService]
		}),
		AuthModule.forRootAsync({
			imports: [DatabaseModule, EnvModule, CacheModule],
			useFactory: (
				database: NodePgDatabase,
				envService: EnvService,
				cacheProvider: CacheProvider,
				mailService: MailService
			) => ({
				auth: betterAuth({
					database: drizzleAdapter(database, {
						provider: 'pg',
						usePlural: true
					}),
					emailAndPassword: {
						enabled: true,
						sendResetPassword: async ({ user, url }) => {
							await mailService.sendResetPasswordEmail({ user, url })
						},
						onPasswordReset: async ({ user }) => {
							const requestPasswordResetUrl = new URL(
								'/request-password-reset',
								envService.get('UI_URL')
							).toString()

							await mailService.sendOnPasswordResetConfirmationEmail({
								user,
								requestPasswordResetUrl
							})

							// Invalidate the per-email password reset request cache after a successful password reset
							const cacheKey = `${RESET_PASSWORD_CACHE_KEY}_${user.email}`
							try {
								await cacheProvider.del(cacheKey)
							} catch {
								// Log the error but don't throw it, as we don't want to block the password reset flow if cache invalidation fails
								logger.error(
									`Failed to invalidate password reset cache for user with email: ${user.email}`
								)
							}
						}
					},
					trustedOrigins: [envService.get('UI_URL')]
				})
			}),
			inject: [DATABASE_CONNECTION, EnvService, CacheProvider, MailService]
		}),
		ORPCModule.forRoot({
			context: () => ({ request: requestContextStorage.getStore() as Request }), // per-request context via AsyncLocalStorage
			eventIteratorKeepAliveInterval: 5000, // Keep-alive interval for event streams for 5 seconds.
			customJsonSerializers: [],
			plugins: [
				new RethrowHandlerPlugin({
					// Rethrow all non-ORPCError errors
					// This allows unhandled exceptions to bubble up to NestJS global exception filters
					filter: (error) => !(error instanceof ORPCError)
				})
			],
			interceptors: [
				onError((error) => {
					if (
						error instanceof ORPCError &&
						error.code === 'BAD_REQUEST' &&
						error.cause instanceof ValidationError
					) {
						const zodError = new z.ZodError(
							error.cause.issues as z.core.$ZodIssue[]
						)

						throw new ORPCError('INPUT_VALIDATION_FAILED', {
							status: 422,
							message: z.prettifyError(zodError),
							data: z.flattenError(zodError),
							cause: error.cause
						})
					}

					if (
						error instanceof ORPCError &&
						error.code === 'INTERNAL_SERVER_ERROR' &&
						error.cause instanceof ValidationError
					) {
						throw new ORPCError('OUTPUT_VALIDATION_FAILED', {
							cause: error.cause
						})
					}

					if (
						!(
							error instanceof ORPCError &&
							error.cause instanceof ValidationError
						)
					) {
						logger.error(error.message, error.stack)
					}
				})
			]
		}),
		EnvModule,
		HealthModule,
		DatabaseModule,
		BookmarksModule,
		TagsModule,
		PaginationModule,
		UploadModule,
		UsersModule,
		RedisModule,
		MailModule
	],
	controllers: [],
	providers: []
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		// Inject per-request context into the oRPC handlers via AsyncLocalStorage
		consumer.apply(RequestContextMiddleware).forRoutes('*')
	}
}
