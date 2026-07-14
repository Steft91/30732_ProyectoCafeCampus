import { SetMetadata } from '@nestjs/common';
import { Rol } from '../guards/roles.guard';

export const ROLES_KEY = 'roles';

/**
 * Decorador que define qué roles pueden acceder a una ruta.
 * Se usa junto con RolesGuard.
 *
 * @example
 * @Roles('admin')
 * @Get('usuarios')
 * findAll() { ... }
 *
 * @Roles('admin', 'personal')
 * @Get('pedidos/todos')
 * findAllPedidos() { ... }
 */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
