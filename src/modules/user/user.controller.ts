import {
  Body,
  Controller,
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
import { user } from '@prisma/client';
import { MessageRespDto } from 'src/base/dto';
import { MessageRespModel } from 'src/base/mode';
import { APISummaries, PlainToInstance } from 'src/helpers';
import { FastifyFileInterceptor } from 'src/interceptor/file.interceptor';
import { GetAuthData } from 'src/modules/auth/decorator/get-auth-data.decorator';
import { AdminGuard, UserGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateMediaDto } from '../media/dto/req.dto';
import { GetAllUsersQueryDto, UsernameRequiredDto } from './dto/req.dto';
import {
  GetMyVotedPostIdsRespDto,
  PaginatedGetUsersRespDto,
} from './dto/res.dto';
import { CreateEditorRegisterRequestDto, UpdateUserDto } from './dto/user.dto';
import { EUserModel, LimitedUserModel } from './model/user.model';
import { UserService } from './user.service';

type AuthData = Pick<user, 'role' | 'id' | 'username' | 'email'>;

@ApiTags('USER')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: EUserModel })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Get('info/:username')
  GetAuthDataByUsername(
    @Param('username') username: string,
    @GetAuthData() authData: AuthData,
  ): Promise<EUserModel> {
    return this.userService.GetAuthDataByUsername(username, {
      role: authData.role,
      username: authData.username,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: EUserModel })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Put(':username')
  updateUser(
    @Param('username') username: string,
    @Body() dto: UpdateUserDto,
    @GetAuthData() authData: AuthData,
  ): Promise<EUserModel> {
    return this.userService.updateUser(username, dto, {
      role: authData.role,
      username: authData.username,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: MessageRespModel })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Post('/editor-register-request')
  async createEditorRegisterRequest(
    @Body() dto: CreateEditorRegisterRequestDto,
    @GetAuthData() authData: AuthData,
  ) {
    await this.userService.createEditorRegisterRequest(dto, {
      userId: authData.id,
    });

    return PlainToInstance(MessageRespDto, {
      message: "Your request has been sent. We'll contact you soon.",
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: String })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Post('verify')
  verifyUser(@GetAuthData() authData: AuthData): Promise<string> {
    return this.userService.verifyUser({
      email: authData.email,
      username: authData.username,
    });
  }

  @ApiOkResponse({
    type: MessageRespDto,
  })
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('filename'))
  @Post('/')
  async changeAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateMediaDto,
    @GetAuthData() authData: AuthData,
  ) {
    return this.userService.changeAvatar({
      file,
      userId: authData.id,
    });
  }

  @Get('/top-contributors')
  @ApiOkResponse({
    type: [LimitedUserModel],
  })
  @HttpCode(HttpStatus.OK)
  async getTopContributors(@Query('limit', ParseIntPipe) limit: number) {
    return this.userService.getTopContributors(limit);
  }

  @Get('/my-voted')
  @ApiOperation({ summary: APISummaries.USER })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @ApiOkResponse({
    type: [GetMyVotedPostIdsRespDto],
  })
  @HttpCode(HttpStatus.OK)
  async getMyVotedPostIds(@GetAuthData() authData: AuthData) {
    const userId = authData.id;

    return this.userService.getMyVotedPostIds(userId);
  }

  @Get('/account-mgt/users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: PaginatedGetUsersRespDto })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  async getAllUsers(
    @Query(new ValidationPipe({ transform: true })) query: GetAllUsersQueryDto,
  ): Promise<PaginatedGetUsersRespDto> {
    return this.userService.getAllUsers(query);
  }

  @Get('/account-mgt/editors')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: PaginatedGetUsersRespDto })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  async getAllEditors(
    @Query(new ValidationPipe({ transform: true })) query: GetAllUsersQueryDto,
  ): Promise<PaginatedGetUsersRespDto> {
    return this.userService.getAllEditors(query);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: MessageRespDto })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('/account-mgt/ban')
  async banUser(@Body() dto: UsernameRequiredDto): Promise<MessageRespDto> {
    await this.userService.banUser(dto.username);

    return PlainToInstance(MessageRespDto, {
      message: 'Banned successfully',
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: MessageRespDto })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('/account-mgt/unban')
  async unbanUser(@Body() dto: UsernameRequiredDto): Promise<MessageRespDto> {
    await this.userService.unbanUser(dto.username);

    return PlainToInstance(MessageRespDto, {
      message: 'Unbanned successfully',
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: MessageRespDto })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('/account-mgt/promote-editor')
  async promoteEditor(
    @Body() dto: UsernameRequiredDto,
  ): Promise<MessageRespDto> {
    await this.userService.promoteEditor(dto.username);

    return PlainToInstance(MessageRespDto, {
      message: 'Promoted successfully',
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: MessageRespDto })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('/account-mgt/remove-editor-rights')
  async removeEditorRights(
    @Body() dto: UsernameRequiredDto,
  ): Promise<MessageRespDto> {
    await this.userService.removeEditorRights(dto.username);

    return PlainToInstance(MessageRespDto, {
      message: 'Remove editor right successfully',
    });
  }
}
