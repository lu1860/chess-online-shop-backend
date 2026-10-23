import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import type { LoginInput, RegisterInput } from '../../domain/models/User.ts';
import { toRecord, trimmed } from './validate.ts';

// Con stopAtFirstError se informa el primer decorador que falla, de abajo hacia arriba:
// por eso @IsNotEmpty va al final (se revisa primero).

/** Body de POST /api/auth/register. El rol no se acepta: siempre se registra como "user". */
export class RegisterDto implements RegisterInput {
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @MaxLength(150, { message: 'El correo no puede tener más de 150 caracteres' })
  @IsEmail({}, { message: 'Escribe un correo válido, por ejemplo: nombre@correo.com' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  // bcrypt solo tiene en cuenta los primeros 72 bytes: por eso el máximo
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'La contraseña debe tener al menos una letra y un número' })
  @MaxLength(72, { message: 'La contraseña no puede tener más de 72 caracteres' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  constructor(body: unknown) {
    const payload = toRecord(body);
    this.name = trimmed(payload['name']) as string;
    this.email = (typeof payload['email'] === 'string' ? payload['email'].trim().toLowerCase() : payload['email']) as string;
    this.password = payload['password'] as string;
  }
}

/** Body de POST /api/auth/login. Solo se exige que vengan: el formato lo resuelve el 401 genérico. */
export class LoginDto implements LoginInput {
  @IsString({ message: 'El correo debe ser un texto' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  constructor(body: unknown) {
    const payload = toRecord(body);
    this.email = trimmed(payload['email']) as string;
    this.password = payload['password'] as string;
  }
}
