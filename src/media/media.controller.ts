import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { APISummaries, MessageModel } from 'src/helpers';
import { FastifyFileInterceptor } from 'src/interceptor/file.interceptor';
import { FirebaseService } from './../modules/firebase/firebase.service';
import { CreateMediaDto, UpdateMediaDto, UploadMediaDto } from './dto/req.dto';
import { MediaService } from './media.service';

@Controller('media')
@ApiTags('MEDIA')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post()
  create(@Body() createMediaDto: CreateMediaDto) {
    return this.mediaService.create(createMediaDto);
  }

  @Get()
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediaService.update(+id, updateMediaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaService.remove(+id);
  }

  @ApiOkResponse({ type: MessageModel })
  @ApiOperation({ summary: APISummaries.USER })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  // @UseGuards(UserGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('fileName'))
  @Post('uploadMedia')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadMediaDto,
  ) {
    return this.firebaseService.uploadFile({
      buffer: file.buffer,
      folder: body.folder,
      fileName: body.fileName,
      overrideFileName: body.overrideFileName,
    });
  }
}
