import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { PaginationQuery } from 'src/base/query';
import { APISummaries, PlainToInstance } from 'src/helpers';
import { FastifyFileInterceptor } from 'src/interceptor/file.interceptor';
import { GetAuthData } from 'src/modules/auth/decorator/get-auth-data.decorator';
import { AdminGuard, UserGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateMediaDto } from '../media/dto/req.dto';
import { CreateEditorRegisterRequestDto, UpdateUserDto } from './dto/user.dto';
import { UserModel } from './model/user.model';
import { UserService } from './user.service';

type AuthData = Pick<user, 'role' | 'id' | 'username' | 'email'>;

@ApiTags('USER')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: UserModel })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get()
  getAllUsers(
    @Query(new ValidationPipe({ transform: true })) query: PaginationQuery,
  ): Promise<UserModel[]> {
    return this.userService.getAllUsers(query);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: UserModel })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Get('info/:username')
  GetAuthDataByUsername(
    @Param('username') username: string,
    @GetAuthData() authData: AuthData,
  ): Promise<UserModel> {
    return this.userService.GetAuthDataByUsername(username, {
      role: authData.role,
      username: authData.username,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: UserModel })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Put(':username')
  updateUser(
    @Param('username') username: string,
    @Body() dto: UpdateUserDto,
    @GetAuthData() authData: AuthData,
  ): Promise<UserModel> {
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
}
