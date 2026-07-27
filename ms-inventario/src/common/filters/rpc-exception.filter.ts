import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { Sentry } from '../../observability/sentry';

export type InventarioTransport = 'tcp' | 'redis' | 'rabbitmq';

const CAMPOS_SENSIBLES = ['usuarioId', 'password', 'token', 'email'];

function sanear(datos: unknown): unknown {
  if (!datos || typeof datos !== 'object') {
    return datos;
  }
  const copia: Record<string, unknown> = { ...(datos as Record<string, unknown>) };
  for (const campo of CAMPOS_SENSIBLES) {
    if (campo in copia) {
      copia[campo] = '[REDACTED]';
    }
  }
  return copia;
}

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly transport: InventarioTransport,
    private readonly operacion: string,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): Observable<never> {
    const payload = host.switchToRpc().getData<Record<string, unknown> | undefined>();
    const rawPedidoId = payload && typeof payload === 'object' ? payload.pedidoId : undefined;
    const pedidoId =
      typeof rawPedidoId === 'string' || typeof rawPedidoId === 'number' ? String(rawPedidoId) : undefined;
    const datosSaneados = sanear(payload);

    Sentry.addBreadcrumb({
      category: 'rpc',
      level: 'error',
      message: `Excepcion en ${this.operacion}`,
      data: typeof datosSaneados === 'object' ? (datosSaneados as Record<string, unknown>) : undefined,
    });

    Sentry.withScope((scope) => {
      scope.setTag('service', 'ms-inventario');
      scope.setTag('transport', this.transport);
      if (pedidoId) {
        scope.setTag('pedido_id', pedidoId);
      }
      scope.setContext('operacion', { handler: this.operacion, pedidoId: pedidoId ?? null });
      Sentry.captureException(exception);
    });

    const error = exception instanceof RpcException ? exception.getError() : exception;
    return throwError(() => error);
  }
}
