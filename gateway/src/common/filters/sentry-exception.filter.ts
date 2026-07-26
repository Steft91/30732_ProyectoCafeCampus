import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Sentry } from '../../observability/sentry';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    Sentry.withScope((scope) => {
      scope.setTag('service', 'gateway');
      scope.setTag('http.status_code', String(status));
      scope.setContext('request', {
        method: request.method,
        url: request.originalUrl,
      });

      if (status >= 500 || process.env.SENTRY_CAPTURE_HTTP_ERRORS === 'true') {
        Sentry.captureException(exception);
      }
    });

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      response.status(status).json(body);
      return;
    }

    response.status(status).json({
      statusCode: status,
      message: 'Internal server error',
    });
  }
}
