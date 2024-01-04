import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { PostStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { UploadFileDto } from 'src/base/dto';
import { PaginationQuery } from 'src/base/query';

export class PostIdRequiredDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number, required: true })
  id: number;
}

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

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  secondaryText?: string;

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

export class UpdatePostDto extends IntersectionType(CreatePostDto) {}

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

export class ReadPostDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(100)
  @Min(0)
  @ApiProperty({ type: Number, required: false, nullable: true })
  percentage: number;

  @IsOptional()
  @Type(() => String)
  @IsString()
  @ApiProperty({ type: String, required: false, nullable: true })
  IP?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number, required: false, nullable: true })
  userId?: number;
}

export class GetPostCommentsQueryDto extends IntersectionType(
  PaginationQuery,
) {}

export class GetReadPostsQueryDto extends IntersectionType(PaginationQuery) {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number, required: false, nullable: true })
  userId?: number;

  @IsOptional()
  @Type(() => String)
  @IsString()
  @ApiProperty({ type: String, required: false, nullable: true })
  IP?: string;
}
