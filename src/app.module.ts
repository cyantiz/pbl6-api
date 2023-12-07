import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import AppConfig from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { ChoreModule } from './modules/chore/chore.module';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { MailModule } from './modules/mail/mail.module';
import { MediaModule } from './modules/media/media.module';
import { PostModule } from './modules/post/post.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ReportModule } from './modules/report/report.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [AppConfig],
    }),
    AuthModule,
    MediaModule,
    FirebaseModule,
    MailModule,
    UserModule,
    ReportModule,
    PostModule,
    CategoryModule,
    ChoreModule,
  ],
})
export class AppModule {}
