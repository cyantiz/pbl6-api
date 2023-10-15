import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import {
  AdminStrategy,
  ModeratorStrategy,
  UserStrategy,
} from './strategy/jwt.strategy';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    AdminStrategy,
    UserStrategy,
    ModeratorStrategy,
    MailService,
  ],
})
export class AuthModule {}
