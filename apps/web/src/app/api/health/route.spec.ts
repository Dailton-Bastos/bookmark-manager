import { describe, expect, it } from 'vitest'

import { GET } from './route'

describe('GET /api/health', () => {
	it('returns 200 with ok status and an ISO timestamp', async () => {
		const response = GET()
		const body = await response.json()

		expect(response.status).toBe(200)
		expect(body).toMatchObject({ status: 'ok' })
		expect(typeof body.timestamp).toBe('string')
		expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false)
	})
})
