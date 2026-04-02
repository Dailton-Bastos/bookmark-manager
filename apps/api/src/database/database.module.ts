import {
	Inject,
	Injectable,
	Logger,
	Module,
	OnApplicationShutdown
} from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import {
	DATABASE_CONNECTION,
	DATABASE_HEALTH_INDICATOR,
	DATABASE_POOL
} from '../shared/constants/database'
import { DatabaseHealthIndicator } from './database.health'

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
	imports: [EnvModule, TerminusModule],
	providers: [
		{
			provide: DATABASE_POOL,
			useFactory: (envService: EnvService) => {
				return new Pool({
					host: envService.get('DATABASE_HOST'),
					port: envService.get('DATABASE_PORT'),
					user: envService.get('DATABASE_USER'),
					password: envService.get('DATABASE_PASSWORD'),
					database: envService.get('DATABASE_NAME')
				})
			},
			inject: [EnvService]
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
