import { Controller, Get, Inject } from '@nestjs/common'
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckService,
	MemoryHealthIndicator
} from '@nestjs/terminus'
import { MailerHealthIndicator } from '@nestjs-modules/mailer'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { DatabaseHealthIndicator } from '../database/database.health'
import { DATABASE_HEALTH_INDICATOR } from '../shared/constants/database'

@Controller('health')
@AllowAnonymous()
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private readonly disk: DiskHealthIndicator,
		private readonly memory: MemoryHealthIndicator,
		@Inject(DATABASE_HEALTH_INDICATOR)
		private readonly database: DatabaseHealthIndicator,
		private mailerHealth: MailerHealthIndicator
	) {}

	@Get()
	@HealthCheck()
	check() {
		return this.health.check([
			() =>
				this.disk.checkStorage('storage', {
					path: '/',
					threshold: 250 * 1024 * 1024 * 1024 // 250GB
				}),
			() => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
			() => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
			() => this.database.isHealthy('database'),
			() => this.mailerHealth.isHealthy('mailer')
		])
	}
}
