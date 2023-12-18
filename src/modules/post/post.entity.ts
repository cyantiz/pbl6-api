import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class EPost {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: String })
  title: string;

  @Expose()
  @ApiProperty({ type: String })
  slug: string;

  @Expose()
  @ApiProperty({ type: String })
  @Transform(({ obj }) => {
    return obj.body
      .split('\n')
      .map((line) => `<p>${line}</p>`)
      .join('');
  })
  body: string;

  @Expose()
  @ApiProperty({ type: String })
  secondaryText: string;

  @Expose()
  @ApiProperty({ type: Number })
  userId: number;

  @Expose()
  @ApiProperty({ type: String })
  status: string;

  @Expose()
  @ApiProperty({ type: Date })
  createdAt: Date;

  @Expose()
  @ApiProperty({ type: Date })
  deletedAt: Date;

  @Expose()
  @ApiProperty({ type: Number })
  upvote: number;

  @Expose()
  @ApiProperty({ type: Number })
  downvote: number;

  @Expose()
  @ApiProperty({ type: Number })
  categoryId: number;

  @Expose()
  @ApiProperty({ type: Number })
  thumbnailMediaId: number;
}

export class EPostAuthor {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: String })
  username: string;

  @Expose()
  @ApiProperty({ type: String })
  name: string;

  @Expose()
  @ApiProperty({ type: String })
  avatarUrl: string;
}
