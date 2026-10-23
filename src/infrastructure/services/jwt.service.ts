import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { UnauthorizedError } from '../../application/errors/app.errors.ts';
import { USER_ROLES, type AuthToken, type AuthUser, type UserRole } from '../../domain/models/User.ts';
import type { ITokenService } from '../../domain/services/ITokenService.ts';
import { env } from '../config/env.ts';

export class JwtService implements ITokenService {
  private readonly secret: string;
  private readonly expiresIn: SignOptions['expiresIn'];

  constructor(secret: string = env.jwtSecret, expiresIn: number | string = env.jwtExpiresIn) {
    this.secret = secret;
    this.expiresIn = expiresIn as SignOptions['expiresIn'];
  }

  /** Firma un token con id y role (nada más) que vence según JWT_EXPIRES_IN. */
  generate(user: AuthUser): AuthToken {
    const accessToken = jwt.sign({ id: user.id, role: user.role }, this.secret, {
      expiresIn: this.expiresIn,
      algorithm: 'HS256',
    });
    const { iat, exp } = jwt.decode(accessToken) as JwtPayload;
    return { accessToken, tokenType: 'Bearer', expiresIn: (exp ?? 0) - (iat ?? 0) };
  }

  /** Verifica firma y expiración. Cualquier problema → UnauthorizedError (401). */
  verify(token: string): AuthUser {
    let payload: string | JwtPayload;
    try {
      payload = jwt.verify(token, this.secret, { algorithms: ['HS256'] });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Tu sesión expiró. Inicia sesión de nuevo');
      }
      throw new UnauthorizedError('Token inválido');
    }
    if (typeof payload === 'string' || !Number.isInteger(payload['id']) || !this.isRole(payload['role'])) {
      throw new UnauthorizedError('Token inválido');
    }
    return { id: payload['id'] as number, role: payload['role'] };
  }

  private isRole(value: unknown): value is UserRole {
    return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
  }
}
