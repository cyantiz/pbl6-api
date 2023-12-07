import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class UploadFileDto {
  @ApiProperty({ type: String, format: 'binary' })
  filename: string;
}

export class PaginationRespDto {
  @Expose()
  @ApiProperty({ type: Number })
  totalPage: number;

  @Expose()
  @ApiProperty({ type: Number })
  total: number;

  @Expose()
  @ApiProperty({ type: Number })
  page: number;

  @Expose()
  @ApiProperty({ type: Number })
  pageSize: number;

  @Expose()
  @ApiProperty({ type: Number })
  nextPage: number;
}

export class MessageRespDto {
  @Type(() => String)
  @Expose()
  message: string = null;
}
