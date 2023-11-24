import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class EMedia {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: String })
  fileName: string;

  @Expose()
  @ApiProperty({ type: String })
  url: string;

  @Expose()
  @ApiProperty({ type: Date })
  createdAt: Date;
}
