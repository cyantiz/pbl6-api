import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { PostStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UploadFileDto } from 'src/base/dto';
import { PaginationQuery } from 'src/base/query';

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

export class GetPublishedPostsQuery extends PaginationQuery {
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

  @IsOptional()
  @IsEnum(PostStatus)
  @ApiProperty({
    type: String,
    enum: PostStatus,
    default: PostStatus.PUBLISHED,
    required: false,
  })
  status = PostStatus.PUBLISHED;
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

export class GetMyPostsQuery extends PaginationQuery {
  @IsOptional()
  @IsEnum(PostStatus)
  @ApiProperty({
    type: String,
    enum: PostStatus,
    default: PostStatus.PUBLISHED,
    required: false,
  })
  status? = PostStatus.PUBLISHED;
}
