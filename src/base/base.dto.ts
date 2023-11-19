import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({ type: String, format: 'binary' })
  fileName: string;
}
