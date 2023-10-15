import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sportivefy API')
    .setDescription('Sportivefy API Documentation')
    .setVersion('1.0')
    .setContact('Sportivefy', 'http://localhost', 'sportivefy@gmail.com')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(
    `api/${configService.get('SWAGGER_docsUrl')}`,
    app,
    document,
  );

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(configService.get('APP_PORT'), '0.0.0.0');
}
bootstrap();
