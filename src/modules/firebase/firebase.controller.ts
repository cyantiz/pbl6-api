import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FirebaseService } from './firebase.service';

@Controller('firebase')
@ApiTags('FIREBASE')
export class FirebaseController {
  constructor(private firebaseService: FirebaseService) {}
}
