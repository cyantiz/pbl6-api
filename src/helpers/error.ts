import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';
import { FormatLogger } from './logger';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService?: ConfigService) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const logger = new FormatLogger(exception.name);
    const resp = host.switchToHttp().getResponse<FastifyReply>();

    let errorMessage = exception.getResponse()['message'];
    if (errorMessage instanceof Array) {
      errorMessage = errorMessage.at(0);
    }
    if (exception instanceof InternalServerErrorException) {
      logger.error(exception.message);
    } else {
      logger.warn(exception.message);
    }
    const status = exception.getStatus();

    resp.status(status).send({
      status: false,
      error: errorMessage,
    });
  }
}
