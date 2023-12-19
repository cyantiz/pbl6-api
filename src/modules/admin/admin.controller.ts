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
import { AdminGuard } from '../auth/guard/auth.guard';
import { ApproveEditorRegisterRequestDto } from '../user/dto/user.dto';
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
  @Post('/editor-register-request/approve')
  async approveEditorRegisterRequest(
    @Body() dto: ApproveEditorRegisterRequestDto,
  ) {
    await this.adminService.approveEditorRegisterRequest(dto);

    return PlainToInstance(MessageRespDto, {
      message: 'Approve Editor register request successfully.',
    });
  }
}
