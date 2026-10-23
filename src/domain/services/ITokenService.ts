import type { AuthToken, AuthUser } from '../models/User.ts';

/** Puerto para emitir y verificar tokens. La implementación (JWT) vive en infrastructure. */
export interface ITokenService {
  generate(user: AuthUser): AuthToken;
  /** Lanza UnauthorizedError si el token es inválido, está mal firmado o expiró. */
  verify(token: string): AuthUser;
}
