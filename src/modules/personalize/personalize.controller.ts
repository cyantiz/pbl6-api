import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PersonalizeService } from './personalize.service';

@Controller('personalize')
@ApiTags('PERSONALIZE')
export class PersonalizeController {
  constructor(private personalizeService: PersonalizeService) {}
}
