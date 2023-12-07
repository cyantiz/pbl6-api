import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MessageRespDto } from 'src/base/dto';
import { FastifyFileInterceptor } from 'src/interceptor/file.interceptor';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateMediaDto, CreateMediaFromExternalURLDto } from './dto/req.dto';
import { MediaService } from './media.service';

@Controller('media')
@ApiTags('MEDIA')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @ApiOkResponse({
    type: MessageRespDto,
  })
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('filename'))
  @Post('/')
  async createMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateMediaDto,
  ) {
    return this.mediaService.create({
      file,
    });
  }

  @ApiOkResponse({
    type: MessageRespDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('/external-url')
  async createMediaFromExternalUrl(@Body() dto: CreateMediaFromExternalURLDto) {
    return this.mediaService.createFromExternalUrl(dto);
  }
}
