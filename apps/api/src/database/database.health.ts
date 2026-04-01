import { Inject, Injectable } from '@nestjs/common'
import { HealthIndicatorService } from '@nestjs/terminus'
import { sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DATABASE_CONNECTION } from '../shared/constants/database'

@Injectable()
export class DatabaseHealthIndicator {
	constructor(
		@Inject(DATABASE_CONNECTION)
		private readonly database: NodePgDatabase,
		private readonly healthIndicatorService: HealthIndicatorService
	) {}

	async isHealthy(key: string) {
		const indicator = this.healthIndicatorService.check(key)

		try {
			await this.database.execute(sql`SELECT 1`)

			return indicator.up()
		} catch {
			return indicator.down({
				message: 'Database connection failed'
			})
		}
	}
}
