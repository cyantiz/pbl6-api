import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { PaginationRespDto } from 'src/base/dto';
import { PlainToInstance, PlainToInstanceList } from 'src/helpers';
import { EMedia } from 'src/modules/media/media.entity';
import { ECategory } from '../../category/category.entity';
import { EPost, EPostAuthor } from '../post.entity';

export class ExtendedPostRespDto extends IntersectionType(EPost) {
  @Expose()
  @ApiProperty({ type: EPostAuthor })
  @Transform(({ obj }) => PlainToInstance(EPostAuthor, obj?.author))
  author: EPostAuthor;

  @Expose()
  @ApiProperty({ type: ECategory })
  @Transform(({ obj }) => PlainToInstance(ECategory, obj?.category))
  category: ECategory;

  @Expose()
  @ApiProperty({ type: EMedia })
  @Transform(({ obj }) => PlainToInstance(EMedia, obj?.thumbnailMedia))
  thumbnailMedia: EMedia;

  @Expose()
  @ApiProperty({ type: Number })
  @Transform(({ obj }) => obj.visits?.length)
  visitCount: number;

  @Expose()
  @ApiProperty({ type: Number })
  @Transform(
    ({ obj }) =>
      PlainToInstanceList(
        EMedia,
        obj?.post_media?.map((pm) => pm?.media)?.flat(),
      ) ?? [],
  )
  medias: EMedia[];
}

export class GetPostsRespDto extends PaginationRespDto {
  @Expose()
  @ApiProperty({ type: [ExtendedPostRespDto] })
  @Transform(({ obj }) => PlainToInstanceList(ExtendedPostRespDto, obj?.posts))
  values: ExtendedPostRespDto[];
}
