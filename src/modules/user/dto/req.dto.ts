import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQuery } from 'src/base/query';

export class GetAllUsersQueryDto extends IntersectionType(PaginationQuery) {
  @IsOptional()
  @Type(() => String)
  @IsString()
  @ApiProperty({ type: String, required: false, nullable: true })
  partialName?: string;
}

export class UsernameRequiredDto {
  @IsString()
  @ApiProperty({ type: String, required: true, nullable: false })
  username: string;
}
