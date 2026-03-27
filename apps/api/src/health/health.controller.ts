import { Controller, Get } from '@nestjs/common'
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckService,
	MemoryHealthIndicator
} from '@nestjs/terminus'

@Controller('health')
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private readonly disk: DiskHealthIndicator,
		private readonly memory: MemoryHealthIndicator
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
			() => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024) // 300MB
		])
	}
}
