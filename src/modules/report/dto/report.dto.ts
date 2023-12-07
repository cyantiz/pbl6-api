import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class ReportDto {
  @IsNumber()
  @ApiProperty({ type: Number, nullable: false, required: true })
  postId: number;

  @IsString()
  @ApiProperty({ type: String, nullable: false, required: true })
  reason: string;
}

export class HandleReportDto {
  @Expose()
  @IsEnum(ReportStatus)
  @IsString()
  @ApiProperty({ type: String, nullable: false, required: true })
  status: ReportStatus;
}
