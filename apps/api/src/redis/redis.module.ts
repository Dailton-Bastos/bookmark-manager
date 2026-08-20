import { Global, Logger, Module } from '@nestjs/common'
import Redis from 'ioredis'
import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { REDIS_CLIENT } from '../shared/constants/redis'

const logger = new Logger('RedisModule')

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

				redis.on('error', (err) => logger.error('Redis error:', err))

				return redis
			},
			inject: [EnvService]
		}
	],
	exports: [REDIS_CLIENT]
})
export class RedisModule {}
