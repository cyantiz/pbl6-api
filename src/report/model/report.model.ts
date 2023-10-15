import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class ReportModel {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: String })
  @Transform(({ obj }) => obj.user?.username)
  reporterName: string;

  @Expose()
  @ApiProperty({ type: Number })
  userId: number;

  @Expose()
  @ApiProperty({ type: Number })
  postId: number;

  @Expose()
  @ApiProperty({ type: String })
  reason: string;

  @Expose()
  @ApiProperty({ type: Date })
  createdAt: Date;
}
