import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MessageRespDto } from 'src/base/dto';
import { MessageRespModel } from 'src/base/mode';
import { APISummaries, PlainToInstance } from 'src/helpers';
import {
  ApproveEditorRegisterRequestDto,
  BanUserDto,
} from '../admin/dto/req.dto';
import { AdminGuard } from '../auth/guard/auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@ApiTags('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: MessageRespModel })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('/user-mgt/register-request/approve')
  async approveEditorRegisterRequest(
    @Body() dto: ApproveEditorRegisterRequestDto,
  ) {
    await this.adminService.approveEditorRegisterRequest(dto);

    return PlainToInstance(MessageRespDto, {
      message: 'Approve editor register request successfully.',
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: String })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('/user-mgt/ban')
  banUser(@Body() dto: BanUserDto): Promise<string> {
    return this.adminService.banUser(dto.username);
  }

  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: APISummaries.USER })
  // @ApiOkResponse({ type: UserModel })
  // @ApiBearerAuth()
  // @UseGuards(UserGuard)
  // @Delete('user-mgt/:username')
  // softDeleteUser(
  //   @Param('username') username: string,
  //   @GetAuthData() authData: AuthData,
  // ): Promise<string> {
  //   return this.adminService.softDeleteUser(username, {
  //     role: user.role,
  //     username: user.username,
  //   });
  // }
}
