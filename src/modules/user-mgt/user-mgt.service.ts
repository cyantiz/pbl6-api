import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AuthData } from '../auth/decorator/get-auth-data.decorator';
import { PromoteEditorDto } from './dto/req.dto';

@Injectable()
export class UserMgtService {
  constructor(private readonly prismaService: PrismaService) {}

  async promoteEditor(dto: PromoteEditorDto, authData: AuthData) {
    //
  }
}
