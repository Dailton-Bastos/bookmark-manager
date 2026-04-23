import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { TagsService } from './tags.service'

@Module({
	imports: [DatabaseModule],
	providers: [TagsService],
	exports: [TagsService]
})
export class TagsModule {}
