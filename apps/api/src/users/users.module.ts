import { Module } from '@nestjs/common'
import { CacheModule } from '../cache/cache.module'
import { DatabaseModule } from '../database/database.module'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
	imports: [DatabaseModule, CacheModule],
	controllers: [UsersController],
	providers: [UsersService]
})
export class UsersModule {}
