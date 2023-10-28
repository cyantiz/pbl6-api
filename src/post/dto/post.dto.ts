import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PostStatus } from 'src/enum/post-status.enum';
import { PageDto } from 'src/prisma/helper/prisma.helper';

export class GetAllPostDto extends PageDto {
  @IsString()
  @ApiProperty({
    type: PostStatus,
    required: false,
    nullable: true,
    default: PostStatus.ACTIVE,
  })
  status: PostStatus;
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  body: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true })
  categoryId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: [Number], required: true })
  subcategoryIds: number[];
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
