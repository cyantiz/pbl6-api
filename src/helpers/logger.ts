import {
  ConsoleLogger,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class FormatLogger extends ConsoleLogger {
  private parse(message: any): string {
    return message;
  }

  log(message: any) {
    super.log(this.parse(message));
  }

  warn(message: any) {
    super.warn(this.parse(message));
  }

  error(message: any) {
    super.error(this.parse(message));
  }

  debug(message: any) {
    super.debug(this.parse(message));
  }
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    let ipAddress = request.headers['x-real-ip'];
    if (!ipAddress) ipAddress = ip;

    response.on('close', () => {
      const { statusCode } = response;
      this.logger.log(
        `${method} - ${originalUrl} - ${statusCode} - ${ipAddress}`,
      );
    });

    if (next) {
      next();
    }
  }
}
