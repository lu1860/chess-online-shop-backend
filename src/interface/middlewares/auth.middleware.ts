import type { Request, RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../application/errors/app.errors.ts';
import type { AuthUser, UserRole } from '../../domain/models/User.ts';
import type { ITokenService } from '../../domain/services/ITokenService.ts';
import { JwtService } from '../../infrastructure/services/jwt.service.ts';

// Agrega "user" a la petición de Express; lo llena authenticate cuando el token es válido.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Crea el middleware de AUTENTICACIÓN (¿quién eres?).
 * Lee "Authorization: Bearer <token>", lo verifica y deja { id, role } en req.user.
 * Sin token, con formato incorrecto, inválido o vencido → 401.
 * Recibe el servicio de tokens por parámetro para poder probarlo con un secreto de prueba.
 */
export const createAuthenticate = (tokens: ITokenService): RequestHandler => (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    next(new UnauthorizedError('Debes iniciar sesión para realizar esta acción'));
    return;
  }
  const [scheme, token, ...rest] = header.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== 'bearer' || !token || rest.length > 0) {
    next(new UnauthorizedError('El header debe tener el formato: Authorization: Bearer <token>'));
    return;
  }
  try {
    req.user = tokens.verify(token);
    next();
  } catch (error) {
    next(error);
  }
};

/** Middleware de autenticación de la API, con el JWT_SECRET de las variables de entorno. */
export const authenticate: RequestHandler = createAuthenticate(new JwtService());

/**
 * Middleware de AUTORIZACIÓN por rol (¿puedes hacer esto?). Se usa DESPUÉS de authenticate:
 *   router.delete('/:id', authenticate, requireRole('admin'), controller.remove)
 * Token válido pero con un rol que no está en la lista → 403.
 */
export const requireRole = (...roles: UserRole[]): RequestHandler => (req, _res, next) => {
  if (!req.user) {
    // requireRole sin authenticate antes: se trata como no autenticado
    next(new UnauthorizedError());
    return;
  }
  if (!roles.includes(req.user.role)) {
    next(new ForbiddenError('Esta acción es solo para administradores'));
    return;
  }
  next();
};

export const soloAdmin: RequestHandler = requireRole('admin');

/** Usuario autenticado de la petición, para los controladores de rutas protegidas. */
export const getAuthUser = (req: Request): AuthUser => {
  if (!req.user) throw new UnauthorizedError();
  return req.user;
};
