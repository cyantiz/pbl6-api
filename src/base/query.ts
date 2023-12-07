import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaginationQuery {
  @Type(() => Number)
  @ApiProperty({
    type: 'integer',
    default: null,
    nullable: true,
    required: false,
  })
  page = 1;

  @Type(() => Number)
  @ApiProperty({
    type: 'integer',
    default: null,
    nullable: true,
    required: false,
  })
  pageSize = 12;
}

export class OptionalPaginationQuery {
  @Type(() => Number)
  @ApiProperty({
    type: 'integer',
    default: null,
    nullable: true,
    required: false,
  })
  page?: number = null;

  @Type(() => Number)
  @ApiProperty({
    type: 'integer',
    default: null,
    nullable: true,
    required: false,
  })
  pageSize?: number = null;
}
