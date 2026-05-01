import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { PaginationModule } from '../pagination/pagination.module'
import { TagsModule } from '../tags/tags.module'
import { BookmarksController } from './bookmarks.controller'
import { BookmarksService } from './bookmarks.service'

@Module({
	imports: [DatabaseModule, TagsModule, PaginationModule],
	providers: [BookmarksService],
	controllers: [BookmarksController]
})
export class BookmarksModule {}
