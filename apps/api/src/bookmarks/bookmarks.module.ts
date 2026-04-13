import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { BookmarksController } from './bookmarks.controller'
import { BookmarksService } from './bookmarks.service'

@Module({
	imports: [DatabaseModule],
	providers: [BookmarksService],
	controllers: [BookmarksController]
})
export class BookmarksModule {}
