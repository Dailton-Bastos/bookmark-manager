import {
	Inject,
	Injectable,
	Logger,
	Module,
	OnApplicationShutdown
} from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { DatabaseHealthIndicator } from '../health/database.health'
import {
	DATABASE_CONNECTION,
	DATABASE_HEALTH_INDICATOR,
	DATABASE_POOL
} from '../shared/constants/database'

@Injectable()
class DatabasePoolCleanupService implements OnApplicationShutdown {
	private readonly logger = new Logger(DatabasePoolCleanupService.name)

	constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

	async onApplicationShutdown() {
		await this.pool.end()
		this.logger.log('Database pool closed')
	}
}

@Module({
	imports: [ConfigModule, TerminusModule],
	providers: [
		{
			provide: DATABASE_POOL,
			useFactory: (configService: ConfigService) => {
				return new Pool({
					connectionString: configService.getOrThrow('DATABASE_URL')
				})
			},
			inject: [ConfigService]
		},
		{
			provide: DATABASE_CONNECTION,
			useFactory: (pool: Pool) => {
				return drizzle({ client: pool })
			},
			inject: [DATABASE_POOL]
		},
		{
			provide: DATABASE_HEALTH_INDICATOR,
			useClass: DatabaseHealthIndicator
		},
		DatabasePoolCleanupService
	],
	exports: [DATABASE_CONNECTION, DATABASE_HEALTH_INDICATOR]
})
export class DatabaseModule {}
