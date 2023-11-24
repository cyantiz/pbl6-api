import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UploadFileDto } from 'src/base/base.dto';
import { PostStatus } from 'src/enum/post.enum';
import { PaginationQuery } from 'src/helpers';

export class GetPostsQuery extends PaginationQuery {
  @IsString()
  @ApiProperty({
    type: PostStatus,
    required: false,
    nullable: true,
    default: PostStatus.PUBLISHED,
  })
  status?: PostStatus;

  @IsOptional()
  @ApiProperty({ type: [String], required: false, nullable: true })
  category?: string[];
}

export class CreatePostDto extends IntersectionType(UploadFileDto) {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  body: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number, required: true })
  categoryId: number;

  @IsOptional()
  @ApiProperty({ type: [Number], required: false })
  subcategoryIds?: number[];
}

export class CreateChangeRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true })
  postId: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  body: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: Number, required: false })
  categoryId: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: [Number], required: false })
  subcategoryIds: number[];
}

export class GetPopularPostsQuery {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    default: 5,
  })
  limit: number;
}
