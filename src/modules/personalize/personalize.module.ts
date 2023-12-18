import { Module } from '@nestjs/common';
import { PersonalizeController } from './personalize.controller';
import { PersonalizeService } from './personalize.service';

@Module({
  controllers: [PersonalizeController],
  providers: [PersonalizeService],
})
export class PersonalizeModule {}
