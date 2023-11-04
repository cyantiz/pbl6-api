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
import { APISummaries, PaginationQuery } from 'src/helpers';
import { GetUser } from 'src/modules/auth/decorator/get-user.decorator';
import { AdminGuard, UserGuard } from 'src/modules/auth/guard/auth.guard';
import { BanUserDto, UpdateUserDto } from './dto/user.dto';
import { UserModel } from './model/user.model';
import { UserService } from './user.service';

type UserType = Pick<user, 'role' | 'id' | 'username' | 'email'>;

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
  getUserByUsername(
    @Param('username') username: string,
    @GetUser() user: UserType,
  ): Promise<UserModel> {
    return this.userService.getUserByUsername(username, {
      role: user.role,
      username: user.username,
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
    @GetUser() user: UserType,
  ): Promise<UserModel> {
    return this.userService.updateUser(username, dto, {
      role: user.role,
      username: user.username,
    });
  }

  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: APISummaries.USER })
  // @ApiOkResponse({ type: UserModel })
  // @ApiBearerAuth()
  // @UseGuards(UserGuard)
  // @Delete(':username')
  // deleteUser(
  //   @Param('username') username: string,
  //   @GetUser() user: UserType,
  // ): Promise<string> {
  //   return this.userService.deleteUser(username, {
  //     role: user.role,
  //     username: user.username,
  //   });
  // }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: String })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('ban')
  banUser(@Body() dto: BanUserDto): Promise<string> {
    return this.userService.banUser(dto.username);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: String })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Post('verify')
  verifyUser(@GetUser() user: UserType): Promise<string> {
    return this.userService.verifyUser({
      email: user.email,
      username: user.username,
    });
  }
}
