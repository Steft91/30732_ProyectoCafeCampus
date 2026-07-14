import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UsuarioPayload } from '../common/decorators/usuario-actual.decorator';

/**
 * Nota: En esta versión base los usuarios están en memoria.
 * Cuando se integre la autenticación real (OAuth2 / Auth0),
 * este servicio se reemplaza sin afectar el resto del sistema.
 * SRP: este servicio solo maneja autenticación.
 */
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // Usuarios de prueba hasta integrar auth real
  private readonly usuariosMock = [
    { id: '1', email: 'admin@campus.edu', password: 'admin123', rol: 'admin' as const },
    { id: '2', email: 'personal@campus.edu', password: 'personal123', rol: 'personal' as const },
    { id: '3', email: 'estudiante@campus.edu', password: 'est123', rol: 'estudiante' as const },
  ];

  login(loginDto: LoginDto): { access_token: string; rol: string } {
    const usuario = this.usuariosMock.find(
      (u) => u.email === loginDto.email && u.password === loginDto.password,
    );

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload: Omit<UsuarioPayload, 'iat' | 'exp'> = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      rol: usuario.rol,
    };
  }
}
