import { Module } from '@nestjs/common'
import { CacheModule } from '../cache/cache.module'
import { DatabaseModule } from '../database/database.module'
import { EnvModule } from '../env/env.module'
import { PaginationModule } from '../pagination/pagination.module'
import { TagsModule } from '../tags/tags.module'
import { BookmarksController } from './bookmarks.controller'
import { BookmarksService } from './bookmarks.service'

@Module({
	imports: [
		DatabaseModule,
		TagsModule,
		PaginationModule,
		CacheModule,
		EnvModule
	],
	providers: [BookmarksService],
	controllers: [BookmarksController]
})
export class BookmarksModule {}
