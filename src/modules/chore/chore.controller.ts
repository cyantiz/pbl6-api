import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MessageRespDto } from 'src/base/dto';
import { APISummaries } from 'src/helpers';
import { ChoreService } from './chore.service';

@Controller('chore')
@ApiTags('CHORE')
export class ChoreController {
  constructor(private choreService: ChoreService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: MessageRespDto })
  @Post('getFromDanTri')
  getFromDanTri() {
    return this.choreService.getFromDanTri();
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: MessageRespDto })
  @Post('getFromVnExpress')
  getFromVnExpress() {
    return this.choreService.getFromVNExpress();
  }
}
