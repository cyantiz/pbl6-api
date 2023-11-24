import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { user } from '@prisma/client';
import { PostStatus } from 'src/enum/post.enum';
import { Role } from 'src/enum/role.enum';
import { APISummaries, PlainToInstance } from 'src/helpers';
import { MessageModel } from 'src/helpers/prisma';
import { GetUser } from 'src/modules/auth/decorator/get-user.decorator';
import { UserGuard } from 'src/modules/auth/guard/auth.guard';
import { PostService } from './post.service';
import {
  CreateChangeRequestDto,
  CreatePostDto,
  GetPostsQuery,
} from './req.dto';
import { PostRespDto } from './res.dto';

type UserType = Pick<user, 'role' | 'id' | 'username'>;

@Controller('post')
@ApiTags('POST')
export class PostController {
  constructor(private postService: PostService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: PostRespDto })
  @Get()
  async getPosts(
    @Query(new ValidationPipe({ transform: true })) query: GetPostsQuery,
    @GetUser() user: UserType,
  ): Promise<PostRespDto[]> {
    const isAdmin = user?.role === Role.ADMIN;

    query.status = isAdmin ? query.status ?? undefined : PostStatus.PUBLISHED;
    if (!Array.isArray(query.category)) query.category = [query.category];

    return this.postService.get({
      ...query,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: PostRespDto })
  @Get(':id')
  async getPostById(
    @Param('id', ParseIntPipe) postId: number,
    @GetUser() user: UserType,
  ): Promise<PostRespDto> {
    const post = await this.postService.getById(postId);

    if (user.role !== Role.ADMIN && post.status !== PostStatus.PUBLISHED) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: PostRespDto })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Post()
  async createPost(
    @Body() dto: CreatePostDto,
    @GetUser() user: UserType,
  ): Promise<PostRespDto> {
    return this.postService.create(dto, {
      role: user.role,
      username: user.username,
      userId: user.id,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: PostRespDto })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Delete('id')
  async deletePostById(
    @Param('id', ParseIntPipe) postId: number,
    @GetUser() user: UserType,
  ): Promise<MessageModel> {
    await this.postService.deletePostById(postId, {
      role: user.role,
      username: user.username,
      userId: user.id,
    });

    return PlainToInstance(MessageModel, { message: 'Deleted successfully' });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: PostRespDto })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Put()
  async createChangeRequest(
    @Body() dto: CreateChangeRequestDto,
    @GetUser() user: UserType,
  ): Promise<MessageModel> {
    await this.postService.createChangeRequest(dto, {
      role: user.role,
      username: user.username,
      userId: user.id,
    });

    return PlainToInstance(MessageModel, {
      message: 'Changes have been requested',
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: [PostRespDto] })
  @Get('/popular')
  async getPopularPost(
    @Param('id', ParseIntPipe) postId: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<PostRespDto[]> {
    const posts = await this.postService.getPopularPosts({
      take: limit,
    });

    return posts;
  }
}
