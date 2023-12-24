import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ApproveEditorRegisterRequestDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number })
  id: number;
}

export class BanUserDto {
  @IsString()
  @ApiProperty({ type: String, required: true, nullable: false })
  username: string;
}
