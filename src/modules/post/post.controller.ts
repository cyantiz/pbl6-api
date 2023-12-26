import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { PostStatus } from '@prisma/client';
import { MessageRespDto } from 'src/base/dto';
import { APISummaries, PlainToInstance } from 'src/helpers';
import { FastifyFileInterceptor } from 'src/interceptor/file.interceptor';
import {
  AuthData,
  GetAuthData,
} from 'src/modules/auth/decorator/get-auth-data.decorator';
import { EditorGuard, UserGuard } from 'src/modules/auth/guard/auth.guard';
import { CommentToPostDto } from '../auth/dto/req.dto';
import {
  CreateChangeRequestDto,
  CreatePostDto,
  GetMyPostsQuery,
  GetPopularPostsQuery,
  GetPostCommentsQueryDto,
  GetPostsQuery,
  GetPublishedPostsQuery,
  SaveReadingProgressDto,
} from './dto/req.dto';
import {
  ExtendedPostRespDto,
  PaginatedGetCommentsRespDto,
  PaginatedGetPostsRespDto,
} from './dto/res.dto';
import { EComment } from './post.entity';
import { PostService } from './post.service';

@Controller('post')
@ApiTags('POST')
export class PostController {
  constructor(private postService: PostService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: ExtendedPostRespDto })
  @Get()
  async getPosts(
    @Query(new ValidationPipe({ transform: true }))
    query: GetPostsQuery,
  ): Promise<PaginatedGetPostsRespDto> {
    if (!Array.isArray(query.category)) query.category = [query.category];

    return this.postService.get({
      ...query,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: ExtendedPostRespDto })
  @Get('/published')
  async getPublishedPosts(
    @Query(new ValidationPipe({ transform: true }))
    query: GetPublishedPostsQuery,
  ): Promise<PaginatedGetPostsRespDto> {
    if (!Array.isArray(query.category))
      query.category = [query.category].filter(Boolean);

    return this.postService.get({
      ...query,
      status: PostStatus.PUBLISHED,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: ExtendedPostRespDto })
  @Get(':id')
  async getPostById(
    @Param('id', ParseIntPipe) postId: number,
    @GetAuthData() authData: AuthData,
  ): Promise<ExtendedPostRespDto> {
    const post = this.postService.verifyPermissionToReadPost({
      postId,
      ...authData,
    });

    return post;
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: ExtendedPostRespDto })
  @Get('slug/:slug')
  async getPostBySlug(
    @Param('slug') slug: string,
    @GetAuthData() authData: AuthData,
  ): Promise<ExtendedPostRespDto> {
    const post = this.postService.verifyPermissionToReadPost({
      slug,
      ...authData,
    });

    return post;
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: [ExtendedPostRespDto] })
  @Get('search')
  async getPostFromSearch(
    @Query('searchText') searchText: string,
  ): Promise<ExtendedPostRespDto[]> {
    const posts = this.postService.getFromSearch(searchText);

    return posts;
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.EDITOR })
  @ApiOkResponse({ type: ExtendedPostRespDto })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('filename'))
  @Post()
  async createPost(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePostDto,
    @GetAuthData() authData: AuthData,
  ): Promise<ExtendedPostRespDto> {
    return this.postService.create(dto, file, {
      role: authData.role,
      username: authData.username,
      userId: authData.id,
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
    @GetAuthData() authData: AuthData,
  ): Promise<MessageRespDto> {
    await this.postService.deletePostById(postId, {
      role: authData.role,
      username: authData.username,
      userId: authData.id,
    });

    return PlainToInstance(MessageRespDto, { message: 'Deleted successfully' });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: ExtendedPostRespDto })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Put()
  async createChangeRequest(
    @Body() dto: CreateChangeRequestDto,
    @GetAuthData() authData: AuthData,
  ): Promise<MessageRespDto> {
    await this.postService.createChangeRequest(dto, {
      role: authData.role,
      username: authData.username,
      userId: authData.id,
    });

    return PlainToInstance(MessageRespDto, {
      message: 'Changes have been requested',
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.EDITOR })
  @ApiOkResponse({ type: [PaginatedGetPostsRespDto] })
  @ApiBearerAuth()
  @UseGuards(EditorGuard)
  @Get('/mine')
  async getMyPosts(
    @Query() query: GetMyPostsQuery,
    @GetAuthData() authData: AuthData,
  ): Promise<PaginatedGetPostsRespDto> {
    const posts = await this.postService.get({
      userId: authData.id,
      ...query,
    });

    return posts;
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

  @Post('/:id/upvote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: MessageRespDto })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  async upvotePost(
    @GetAuthData() authData: AuthData,
    @Param('id', ParseIntPipe) postId: number,
  ): Promise<MessageRespDto> {
    const userId = authData.id;

    await this.postService.upvotePost(postId, userId);

    return PlainToInstance(MessageRespDto, {
      message: 'Toggle upvote successfully',
    });
  }

  @Post('/:id/downvote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: MessageRespDto })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  async downvotePost(
    @Param('id', ParseIntPipe) postId: number,
    @GetAuthData() authData: AuthData,
  ): Promise<MessageRespDto> {
    const userId = authData.id;

    await this.postService.downvotePost(postId, userId);

    return PlainToInstance(MessageRespDto, {
      message: 'Toggle downvote successfully',
    });
  }

  @Post('/:id/comments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: EComment })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  async commentToPost(
    @Param('id', ParseIntPipe) postId: number,
    @Body() dto: CommentToPostDto,
    @GetAuthData() authData: AuthData,
  ): Promise<EComment> {
    const userId = authData.id;
    const { comment } = dto;

    const newComment = await this.postService.commentToPost({
      postId,
      userId,
      comment,
    });

    return PlainToInstance(EComment, newComment);
  }

  @Get('/:id/comments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: [EComment] })
  async getPostComments(
    @Query() query: GetPostCommentsQueryDto,
    @Param('id', ParseIntPipe) postId: number,
  ): Promise<PaginatedGetCommentsRespDto> {
    const result = await this.postService.getPostComments({
      postId,
      ...query,
    });

    return result;
  }

  @Post('/:id/save-reading-progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: MessageRespDto })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  async saveReadingProgress(
    @Param('id', ParseIntPipe) postId: number,
    @Body() dto: SaveReadingProgressDto,
    @GetAuthData() authData: AuthData,
  ): Promise<MessageRespDto> {
    const userId = authData.id;
    const { progress } = dto;

    await this.postService.saveReadingProgress({
      postId,
      userId,
      progress,
    });

    return PlainToInstance(MessageRespDto, {
      message: 'Saved reading progress successfully',
    });
  }
}
