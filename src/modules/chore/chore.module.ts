import { Module } from '@nestjs/common';
import { ChoreController } from './chore.controller';
import { ChoreService } from './chore.service';

@Module({
  controllers: [ChoreController],
  providers: [ChoreService],
})
export class ChoreModule {}
