import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

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
