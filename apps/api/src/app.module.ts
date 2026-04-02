import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validate } from './config/env.config'
import { DatabaseModule } from './database/database.module'
import { EnvModule } from './env/env.module'
import { HealthModule } from './health/health.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			expandVariables: true,
			validate
		}),
		EnvModule,
		HealthModule,
		DatabaseModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
