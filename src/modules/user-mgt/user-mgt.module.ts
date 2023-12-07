import { Module } from '@nestjs/common';
import { UserMgtController } from './user-mgt.controller';
import { UserMgtService } from './user-mgt.service';

@Module({
  controllers: [UserMgtController],
  providers: [UserMgtService],
})
export class PostModule {}
