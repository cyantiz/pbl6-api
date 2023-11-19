import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { UploadFileDto } from 'src/base/base.dto';

export class CreateMediaDto {}

export class UpdateMediaDto extends PartialType(CreateMediaDto) {}

export class UploadMediaDto extends IntersectionType(UploadFileDto) {
  @IsOptional()
  @Type(() => String)
  @IsString()
  @ApiProperty({ type: String, required: false })
  folder?: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  @ApiProperty({ type: String, required: false })
  overrideFileName?: string;
}
