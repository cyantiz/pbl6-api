import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class EAuth {
  @Expose()
  @ApiProperty({ type: String })
  accessToken: string;

  @Expose()
  @ApiProperty({ type: String })
  refreshToken: string;
}

export class EAuthPayload {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: String })
  role: string;

  @Expose()
  @ApiProperty({ type: String })
  username: string;

  @Expose()
  @ApiProperty({ type: String })
  email: string;
}

export class EUserMe {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: String })
  username: string;

  @Expose()
  @ApiProperty({ type: String })
  email: string;

  @Expose()
  @ApiProperty({ type: String })
  name: string;

  @Expose()
  @ApiProperty({ type: String })
  role: string;

  @Expose()
  @ApiProperty({ type: String })
  avatarUrl: string;
}
