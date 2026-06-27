import { Module } from '@nestjs/common'
import { CacheProvider } from './cache.provider'

@Module({
	providers: [CacheProvider],
	exports: [CacheProvider]
})
export class CacheModule {}
