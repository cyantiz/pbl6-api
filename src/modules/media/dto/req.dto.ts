import { IntersectionType, PartialType } from '@nestjs/swagger';
import { UploadFileDto } from 'src/base/dto';

export class CreateMediaDto extends IntersectionType(UploadFileDto) {
  description: string;
}
export class CreateMediaFromExternalURLDto {
  url: string;
  alt: string;
}
export class UpdateMediaDto extends PartialType(CreateMediaDto) {}
