import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { HealthModule } from './health/health.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		HealthModule,
		DatabaseModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
