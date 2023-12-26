import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { PlainToInstance } from 'src/helpers';

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

export class ECommentAuthor extends IntersectionType(EPostAuthor) {}

export class EComment {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: String })
  text: string;

  @Expose()
  @ApiProperty({ type: Number })
  postId?: number;

  @Expose()
  @ApiProperty({ type: Number })
  parentCommentId?: number;

  @Expose()
  @ApiProperty({ type: Number })
  upvote: number;

  @Expose()
  @ApiProperty({ type: Number })
  downvote?: number;

  @Expose()
  @ApiProperty({ type: Date })
  createdAt: Date;

  @Expose()
  @ApiProperty({ type: ECommentAuthor })
  @Transform(({ obj }) => PlainToInstance(ECommentAuthor, obj?.user))
  author: ECommentAuthor;

  @Expose()
  @ApiProperty({ type: EComment, required: false })
  parentComment?: EComment;

  @Expose()
  @ApiProperty({ type: EComment, required: false })
  childComments?: EComment[];
}
