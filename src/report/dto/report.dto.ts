import { ApiProperty } from '@nestjs/swagger';
import { report_status } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsIn, IsNumber, IsString } from 'class-validator';
import { ReportStatus } from 'src/enum/report-status.enum';

export class ReportDto {
  @IsNumber()
  @ApiProperty({ type: Number, nullable: false, required: true })
  postId: number;

  @IsString()
  @ApiProperty({ type: String, nullable: false, required: true })
  reason: string;
}

export class HandleReportDto {
  @IsIn(Object.values(ReportStatus))
  @Expose()
  @IsString()
  @ApiProperty({ type: String, nullable: false, required: true })
  status: report_status;
}
