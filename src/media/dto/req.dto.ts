import { IntersectionType, PartialType } from '@nestjs/swagger';
import { UploadFileDto } from 'src/base/base.dto';

export class CreateMediaDto extends IntersectionType(UploadFileDto) {}

export class UpdateMediaDto extends PartialType(CreateMediaDto) {}
