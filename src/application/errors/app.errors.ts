/**
 * Errores de la aplicación. No saben nada de HTTP: el middleware de errores
 * (interface/middlewares/error.handler.ts) es quien los traduce a códigos de estado.
 */

/** Mapa campo → mensaje, para que el frontend muestre cada error junto a su campo. */
export type FieldErrors = Record<string, string>;

/** Datos inválidos en el body, los params o la query → 400 */
export class BadRequestError extends Error {
  readonly fields?: FieldErrors;
  constructor(message: string, fields?: FieldErrors) {
    super(message);
    this.name = 'BadRequestError';
    this.fields = fields;
  }
}

/** No autenticado: falta el token, es inválido o expiró; o credenciales incorrectas → 401 */
export class UnauthorizedError extends Error {
  constructor(message = 'Debes iniciar sesión') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/** Autenticado, pero su rol no tiene permiso para la acción → 403 */
export class ForbiddenError extends Error {
  constructor(message = 'No tienes permiso para realizar esta acción') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/** El recurso no existe (o fue eliminado) → 404 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/** Choca con un dato que ya existe, por ejemplo un email repetido → 409 */
export class ConflictError extends Error {
  readonly fields?: FieldErrors;
  constructor(message: string, fields?: FieldErrors) {
    super(message);
    this.name = 'ConflictError';
    this.fields = fields;
  }
}
