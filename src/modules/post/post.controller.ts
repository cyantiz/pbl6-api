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
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { user } from '@prisma/client';
import { PostStatus } from 'src/enum/post.enum';
import { Role } from 'src/enum/role.enum';
import { APISummaries, PlainToInstance } from 'src/helpers';
import { MessageModel } from 'src/helpers/prisma';
import { FastifyFileInterceptor } from 'src/interceptor/file.interceptor';
import { GetUser } from 'src/modules/auth/decorator/get-user.decorator';
import { UserGuard } from 'src/modules/auth/guard/auth.guard';
import { ModeratorGuard } from './../auth/guard/auth.guard';
import { PostService } from './post.service';
import {
  CreateChangeRequestDto,
  CreatePostDto,
  GetPopularPostsQuery,
  GetPostsQuery,
} from './req.dto';
import { ExtendedPostRespDto } from './res.dto';

type UserType = Pick<user, 'role' | 'id' | 'username'>;

@Controller('post')
@ApiTags('POST')
export class PostController {
  constructor(private postService: PostService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: ExtendedPostRespDto })
  @Get()
  async getPosts(
    @Query(new ValidationPipe({ transform: true })) query: GetPostsQuery,
    @GetUser() user: UserType,
  ): Promise<ExtendedPostRespDto[]> {
    const isAdmin = user?.role === Role.ADMIN;

    query.status = isAdmin ? query.status ?? undefined : PostStatus.PUBLISHED;
    if (!Array.isArray(query.category)) query.category = [query.category];

    return this.postService.get({
      ...query,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: ExtendedPostRespDto })
  @Get(':id')
  async getPostById(
    @Param('id', ParseIntPipe) postId: number,
    @GetUser() user: UserType,
  ): Promise<ExtendedPostRespDto> {
    const post = await this.postService.getById(postId);

    if (user?.role !== Role.ADMIN && post.status !== PostStatus.PUBLISHED) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: ExtendedPostRespDto })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('fileName'))
  @Post()
  async createPost(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePostDto,
    @GetUser() user: UserType,
  ): Promise<ExtendedPostRespDto> {
    return this.postService.create(dto, file, {
      role: user.role,
      username: user.username,
      userId: user.id,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: ExtendedPostRespDto })
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
  @ApiOkResponse({ type: ExtendedPostRespDto })
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
  @ApiOkResponse({ type: [ExtendedPostRespDto] })
  @Get('/popular')
  async getPopularPosts(
    @Query() query: GetPopularPostsQuery,
  ): Promise<ExtendedPostRespDto[]> {
    const posts = await this.postService.getPopularPosts({
      take: query.limit,
    });

    return posts;
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: ExtendedPostRespDto })
  @Get('/front-page')
  async getFrontPagePost(): Promise<ExtendedPostRespDto> {
    const post = await this.postService.getFrontPagePost();

    return post;
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.MODERATOR })
  @ApiOkResponse({ type: MessageModel })
  @ApiBearerAuth()
  @UseGuards(ModeratorGuard)
  @Put('/:id/approve')
  async approvePost(
    @Param('id', ParseIntPipe) postId: number,
    @GetUser() user: UserType,
  ): Promise<MessageModel> {
    await this.postService.approvePost(postId, {
      role: user.role,
      username: user.username,
      userId: user.id,
    });

    return PlainToInstance(MessageModel, {
      message: 'Approved',
    });
  }
}
