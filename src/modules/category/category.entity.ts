import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ECategory {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: String })
  name: string;

  @Expose()
  @ApiProperty({ type: String })
  thumbnail: string;

  @Expose()
  @ApiProperty({ type: String })
  slug: string;

  @Expose()
  @ApiProperty({ type: Date })
  createdAt: Date;
}
