import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class PostRespDto {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: String })
  title: string;

  @Expose()
  @ApiProperty({ type: String })
  body: string;

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
  @ApiProperty({ type: String })
  @Transform(({ obj }) => obj.author.username)
  authorUsername: string;

  @Expose()
  @ApiProperty({ type: String })
  @Transform(({ obj }) => obj.author.name)
  authorName: string;

  @Expose()
  @ApiProperty({ type: String })
  @Transform(({ obj }) => obj.category.name)
  categoryName: string;
}
