import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeNewWork } from './notice-new-work.entity';
import { NoticeNewWorkService } from './notice-new-work.service';
import { NoticeNewWorkController } from './notice-new-work.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NoticeNewWork])],
  providers: [NoticeNewWorkService],
  exports: [NoticeNewWorkService],
  controllers: [NoticeNewWorkController],
})
export class NoticeNewWorkModule {}
