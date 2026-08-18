import KeyvRedis from '@keyv/redis'
import { CacheModule } from '@nestjs/cache-manager'
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
import { validate } from './config/env.config'
import { RequestContextMiddleware } from './core/request-context.middleware'
import { DatabaseModule } from './database/database.module'
import { EnvModule } from './env/env.module'
import { EnvService } from './env/env.service'
import { HealthModule } from './health/health.module'
import { PaginationModule } from './pagination/pagination.module'
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
		CacheModule.registerAsync({
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
			imports: [DatabaseModule, EnvModule],
			useFactory: (database: NodePgDatabase, envService: EnvService) => ({
				auth: betterAuth({
					database: drizzleAdapter(database, {
						provider: 'pg',
						usePlural: true
					}),
					emailAndPassword: {
						enabled: true,
						sendResetPassword: async () => {
							// TODO: Implement email sending logic here
						},
						onPasswordReset: async () => {
							// TODO: Implement logic to handle password reset confirmation here
						}
					},
					trustedOrigins: [envService.get('UI_URL')]
				})
			}),
			inject: [DATABASE_CONNECTION, EnvService]
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
		UsersModule
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
