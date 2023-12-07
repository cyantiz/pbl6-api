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
import { PostStatus, Role } from '@prisma/client';
import { MessageRespDto } from 'src/base/dto';
import { PaginationQuery } from 'src/base/query';
import { APISummaries, PlainToInstance } from 'src/helpers';
import { FastifyFileInterceptor } from 'src/interceptor/file.interceptor';
import {
  AuthData,
  GetAuthData,
} from 'src/modules/auth/decorator/get-auth-data.decorator';
import { EditorGuard, UserGuard } from 'src/modules/auth/guard/auth.guard';
import { PostService } from './post.service';
import {
  CreateChangeRequestDto,
  CreatePostDto,
  GetPopularPostsQuery,
  GetPostsQuery,
} from './req.dto';
import { ExtendedPostRespDto, GetPostsByFilterRespDto } from './res.dto';

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
    @GetAuthData() authData: AuthData,
  ): Promise<GetPostsByFilterRespDto> {
    const isAdmin = authData?.role === Role.ADMIN;

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
    @GetAuthData() authData: AuthData,
  ): Promise<ExtendedPostRespDto> {
    const post = await this.postService.getById(postId);

    if (authData?.role !== Role.ADMIN && post.status !== PostStatus.PUBLISHED) {
      throw new NotFoundException('Post not found');
    }

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
    const post = await this.postService.getBySlug(slug);

    if (authData?.role !== Role.ADMIN && post.status !== PostStatus.PUBLISHED) {
      throw new NotFoundException('Post not found');
    }

    return post;
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
  @ApiOkResponse({ type: [GetPostsByFilterRespDto] })
  @ApiBearerAuth()
  @UseGuards(EditorGuard)
  @Get('/mine')
  async getMyPosts(
    @Query() query: PaginationQuery,
    @GetAuthData() authData: AuthData,
  ): Promise<GetPostsByFilterRespDto> {
    return await this.postService.get({
      userId: authData.id,
      ...query,
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
}
