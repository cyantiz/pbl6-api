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
import { APISummaries, PlainToInstance } from 'src/helpers';
import {
  AuthData,
  GetAuthData,
} from 'src/modules/auth/decorator/get-auth-data.decorator';
import { AdminGuard } from 'src/modules/auth/guard/auth.guard';
import { PromoteEditorDto } from './dto/req.dto';

import { MessageRespDto } from 'src/base/dto';
import { UserMgtService } from './user-mgt.service';

@Controller('user-mgt')
@ApiTags('USER MANAGEMENT')
export class UserMgtController {
  constructor(private userMgtService: UserMgtService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: MessageRespDto })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post()
  async promoteEditor(
    @Body() dto: PromoteEditorDto,
    @GetAuthData() authData: AuthData,
  ): Promise<MessageRespDto> {
    await this.userMgtService.promoteEditor(dto, authData);

    return PlainToInstance(MessageRespDto, {
      message: 'Promoted editor successfully',
    });
  }
}
