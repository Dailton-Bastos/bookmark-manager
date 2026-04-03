import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '@thallesp/nestjs-better-auth'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { validate } from './config/env.config'
import { DatabaseModule } from './database/database.module'
import { EnvModule } from './env/env.module'
import { HealthModule } from './health/health.module'
import { DATABASE_CONNECTION } from './shared/constants/database'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			expandVariables: true,
			validate
		}),
		EnvModule,
		HealthModule,
		DatabaseModule,
		AuthModule.forRootAsync({
			imports: [DatabaseModule],
			useFactory: (database: NodePgDatabase) => ({
				auth: betterAuth({
					database: drizzleAdapter(database, {
						provider: 'pg',
						usePlural: true
					}),
					user: { modelName: 'users' },
					session: { modelName: 'sessions' },
					account: { modelName: 'accounts' },
					verificationToken: { modelName: 'verifications' }
				})
			}),
			inject: [DATABASE_CONNECTION]
		})
	],
	controllers: [],
	providers: []
})
export class AppModule {}
