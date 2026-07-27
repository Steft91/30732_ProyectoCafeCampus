import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { Sentry } from '../../observability/sentry';

export type InventarioTransport = 'tcp' | 'redis' | 'rabbitmq';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  constructor(private readonly transport: InventarioTransport) {}

  catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
    Sentry.withScope((scope) => {
      scope.setTag('service', 'ms-inventario');
      scope.setTag('transport', this.transport);
      Sentry.captureException(exception);
    });

    const error = exception instanceof RpcException ? exception.getError() : exception;
    return throwError(() => error);
  }
}
