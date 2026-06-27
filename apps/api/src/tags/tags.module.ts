import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { PaginationModule } from '../pagination/pagination.module'
import { TagsController } from './tags.controller'
import { TagsService } from './tags.service'

@Module({
	imports: [DatabaseModule, PaginationModule],
	providers: [TagsService],
	exports: [TagsService],
	controllers: [TagsController]
})
export class TagsModule {}
