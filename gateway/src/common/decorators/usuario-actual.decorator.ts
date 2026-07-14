import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extrae el usuario autenticado del request.
 * El usuario es inyectado por JwtAuthGuard tras validar el token.
 *
 * @example
 * @Get('mis-pedidos')
 * getMisPedidos(@UsuarioActual() usuario: UsuarioPayload) {
 *   return this.pedidosService.findByUsuario(usuario.sub);
 * }
 */
export const UsuarioActual = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export interface UsuarioPayload {
  sub: string;       // id del usuario
  email: string;
  rol: 'admin' | 'personal' | 'estudiante';
  iat?: number;
  exp?: number;
}
