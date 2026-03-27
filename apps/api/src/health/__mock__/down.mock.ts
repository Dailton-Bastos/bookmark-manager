import type { HealthCheckResult } from '@nestjs/terminus'

export const downMock: HealthCheckResult = {
	status: 'error',
	info: {
		storage: { status: 'down' },
		memory_heap: { status: 'down' },
		memory_rss: { status: 'down' }
	},
	error: {},
	details: {}
}
