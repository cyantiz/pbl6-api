import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty({ type: String })
  @Matches(/^[A-Za-z ]+$/)
  name: string;
}

export class BanUserDto {
  @IsString()
  @ApiProperty({ type: String, required: true, nullable: false })
  username: string;
}

export class CreateEditorRegisterRequestDto {
  @IsOptional()
  @ApiProperty({ type: String })
  message: string;
}

export class ApproveEditorRegisterRequestDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number })
  id: number;
}
