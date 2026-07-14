import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @IsString()
  @MinLength(3, { message: 'La contraseña debe tener al menos 3 caracteres' })
  password: string;
}
