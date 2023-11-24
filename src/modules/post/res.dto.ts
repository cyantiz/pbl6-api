import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { PlainToInstance } from 'src/helpers';
import { ECategory } from '../category/category.entity';
import { EPost, EPostAuthor } from './post.entity';

export class PostRespDto extends IntersectionType(EPost) {
  @Expose()
  @ApiProperty({ type: EPostAuthor })
  @Transform(({ obj }) => PlainToInstance(EPostAuthor, obj?.author))
  author: EPostAuthor;

  @Expose()
  @ApiProperty({ type: ECategory })
  @Transform(({ obj }) => PlainToInstance(ECategory, obj?.category))
  category: ECategory;

  @Expose()
  @ApiProperty({ type: Number })
  @Transform(({ obj }) => obj.visits?.length)
  visitCount: number;
}
