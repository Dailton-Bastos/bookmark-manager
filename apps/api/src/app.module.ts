import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '@thallesp/nestjs-better-auth'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { validate } from './config/env.config'
import { DatabaseModule } from './database/database.module'
import { EnvModule } from './env/env.module'
import { EnvService } from './env/env.service'
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
			imports: [DatabaseModule, EnvModule],
			useFactory: (database: NodePgDatabase, envService: EnvService) => ({
				auth: betterAuth({
					database: drizzleAdapter(database, {
						provider: 'pg',
						usePlural: true
					}),
					emailAndPassword: { enabled: true },
					trustedOrigins: [envService.get('UI_URL')]
				})
			}),
			inject: [DATABASE_CONNECTION, EnvService]
		})
	],
	controllers: [],
	providers: []
})
export class AppModule {}
