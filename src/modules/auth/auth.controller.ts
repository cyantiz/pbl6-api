import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { APISummaries } from 'src/helpers';
import { EAuth, EAuthPayload, EUserMe } from './auth.entity';
import { AuthService } from './auth.service';
import { GetUser } from './decorator/get-user.decorator';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  RequestResetPasswordDto,
  ResetPasswordDto,
  VerifyUserDto,
} from './dto/req.dto';
import { UserGuard } from './guard/auth.guard';
@Controller('auth')
@ApiTags('AUTH')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: APISummaries.UNAUTH })
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({ type: EAuth })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: APISummaries.UNAUTH })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: EAuth })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: APISummaries.UNAUTH })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: EAuth })
  @Post('refresh')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @ApiOperation({ summary: APISummaries.USER })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Get('verify')
  verify(@Query() query: VerifyUserDto, @GetUser() user: EAuthPayload) {
    return this.authService.verify(query, {
      email: user.email,
      username: user.username,
    });
  }

  @ApiOperation({ summary: APISummaries.UNAUTH })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  @Post('request-reset-password')
  resetPasswordRequest(@Body() dto: RequestResetPasswordDto) {
    this.authService.resetPasswordRequest(dto);

    return 'Reset password request sent, please check your email for next steps';
  }

  @ApiOperation({ summary: APISummaries.UNAUTH })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    this.authService.resetPassword(dto);

    return 'Password reset successfully';
  }

  @ApiOperation({ summary: APISummaries.USER })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Get('me')
  me(@GetUser() user: EUserMe) {
    return this.authService.getMe(user.id);
  }
}
