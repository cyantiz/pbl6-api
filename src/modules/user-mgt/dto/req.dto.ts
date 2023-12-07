import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class PromoteEditorDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number, required: true, nullable: false })
  userId: number;
}
