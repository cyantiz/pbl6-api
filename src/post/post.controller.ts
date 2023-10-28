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
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { APISummaries, PlainToInstance } from 'src/helpers/helpers';
import { PostService } from './post.service';
import {
  CreateChangeRequestDto,
  CreatePostDto,
  GetAllPostDto,
} from './dto/post.dto';
import { PostModel } from './model/post.model';
import { UserGuard } from 'src/auth/guard/auth.guard';
import { MessageModel } from 'src/prisma/helper/prisma.helper';

type UserType = Pick<user, 'role' | 'id' | 'username'>;

@Controller('post')
@ApiTags('POST')
export class PostController {
  constructor(private postService: PostService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: PostModel })
  @Get()
  getAllPosts(
    @Query(new ValidationPipe({ transform: true })) query: GetAllPostDto,
    @GetUser() user: UserType,
  ): Promise<PostModel[]> {
    return this.postService.getAllPosts(query, {
      role: user.role,
      username: user.username,
      userId: user.id,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: PostModel })
  @Get(':id')
  getPostById(
    @Param('id', ParseIntPipe) postId: number,
    @GetUser() user: UserType,
  ): Promise<PostModel> {
    return this.postService.getPostById(postId, {
      role: user.role,
      username: user.username,
      userId: user.id,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: PostModel })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Post()
  createPost(
    @Body() dto: CreatePostDto,
    @GetUser() user: UserType,
  ): Promise<PostModel> {
    return this.postService.createPost(dto, {
      role: user.role,
      username: user.username,
      userId: user.id,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: PostModel })
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
  @ApiOkResponse({ type: PostModel })
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
}
