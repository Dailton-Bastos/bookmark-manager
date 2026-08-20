import {
	Global,
	Inject,
	Injectable,
	Logger,
	Module,
	OnApplicationShutdown
} from '@nestjs/common'
import Redis from 'ioredis'
import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { REDIS_CLIENT } from '../shared/constants/redis'

const logger = new Logger('RedisModule')

@Injectable()
export class RedisClientCleanupService implements OnApplicationShutdown {
	private readonly logger = new Logger(RedisClientCleanupService.name)

	constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

	async onApplicationShutdown() {
		try {
			await this.redisClient.quit()
			this.logger.log('Redis client closed')
		} catch (error) {
			this.redisClient.disconnect()
			this.logger.error(
				'Error closing Redis client',
				(error as Error).stack ?? String(error)
			)
		}
	}
}

@Global()
@Module({
	imports: [EnvModule],
	providers: [
		{
			provide: REDIS_CLIENT,
			useFactory: (envService: EnvService) => {
				const redis = new Redis(envService.get('REDIS_URL'), {
					maxRetriesPerRequest: null // Critical for BullMQ workers
				})

				redis.on('error', (err) => logger.error(err.message, err.stack))

				return redis
			},
			inject: [EnvService]
		},
		RedisClientCleanupService
	],
	exports: [REDIS_CLIENT]
})
export class RedisModule {}
