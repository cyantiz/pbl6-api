import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from 'src/modules/mail/mail.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  AdminStrategy,
  EditorStrategy,
  ModeratorStrategy,
  UserStrategy,
} from './strategy/jwt.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    AdminStrategy,
    UserStrategy,
    EditorStrategy,
    ModeratorStrategy,
    MailService,
  ],
})
export class AuthModule {}
