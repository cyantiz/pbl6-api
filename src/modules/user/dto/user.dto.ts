import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty({ type: String })
  @Matches(/^[A-Za-z ]+$/)
  name: string;
}

export class CreateEditorRegisterRequestDto {
  @IsOptional()
  @ApiProperty({ type: String })
  message: string;
}
