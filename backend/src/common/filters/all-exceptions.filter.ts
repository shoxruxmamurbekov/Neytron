import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorBody {
  error: {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
    path: string;
    timestamp: string;
  };
}

/** Yagona xato formati: { error: { statusCode, code, message, details, path, timestamp } } */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Ichki server xatosi';
    let details: unknown;
    let code = 'INTERNAL_ERROR';

    if (isHttp) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as { message?: string | string[]; error?: string };
        if (Array.isArray(body.message)) {
          message = 'Ma’lumotlar noto‘g‘ri';
          details = body.message;
        } else if (body.message) {
          message = body.message;
        }
      }
      code = HttpStatus[statusCode]
        ? String(HttpStatus[statusCode])
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .toUpperCase()
        : 'HTTP_ERROR';
    } else {
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorBody = {
      error: {
        statusCode,
        code,
        message,
        details,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(statusCode).json(body);
  }
}
