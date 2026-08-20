import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { DatabaseModule } from '../database/database.module'
import { MailModule } from '../mail/mail.module'
import { HealthController } from './health.controller'

@Module({
	imports: [TerminusModule, DatabaseModule, MailModule],
	controllers: [HealthController],
	providers: []
})
export class HealthModule {}
