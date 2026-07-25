import { ArgumentsHost, Catch } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch(RpcException)
export class RpcExceptionFilter {
  catch(exception: RpcException, _host: ArgumentsHost): Observable<never> {
    return throwError(() => exception.getError());
  }
}
