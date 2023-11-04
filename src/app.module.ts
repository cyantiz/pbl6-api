import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { MailModule } from './modules/mail/mail.module';
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
    }),
    AuthModule,
    MailModule,
    UserModule,
    ReportModule,
    PostModule,
    CategoryModule,
  ],
})
export class AppModule {}
