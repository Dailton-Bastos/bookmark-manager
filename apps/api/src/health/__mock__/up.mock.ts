import type { HealthCheckResult } from '@nestjs/terminus'

export const upMock: HealthCheckResult = {
	status: 'ok',
	info: {
		storage: { status: 'up' },
		memory_heap: { status: 'up' },
		memory_rss: { status: 'up' }
	},
	error: {},
	details: {}
}
