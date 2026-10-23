import type { ErrorRequestHandler, RequestHandler } from 'express';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../application/errors/app.errors.ts';

/** Forma de todos los errores de la API: { error, fields? } */
interface ErrorBody {
  error: string;
  fields?: Record<string, string>;
}

// Los errores de Prisma traen un código "P2xxx". Se reconocen por su forma para no importar
// Prisma fuera de infrastructure.
const prismaCode = (error: unknown): string | undefined => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === 'string' && /^P\d{4}$/.test(code)) return code;
  }
  return undefined;
};

const toResponse = (error: unknown): { status: number; body: ErrorBody } => {
  if (error instanceof BadRequestError) {
    return { status: 400, body: { error: error.message, ...(error.fields && { fields: error.fields }) } };
  }
  if (error instanceof UnauthorizedError) return { status: 401, body: { error: error.message } };
  if (error instanceof ForbiddenError) return { status: 403, body: { error: error.message } };
  if (error instanceof NotFoundError) return { status: 404, body: { error: error.message } };
  if (error instanceof ConflictError) {
    return { status: 409, body: { error: error.message, ...(error.fields && { fields: error.fields }) } };
  }

  // Body con JSON mal formado (lo lanza express.json)
  if (typeof error === 'object' && error !== null && (error as { type?: unknown }).type === 'entity.parse.failed') {
    return { status: 400, body: { error: 'El cuerpo de la petición no es un JSON válido' } };
  }
  if (typeof error === 'object' && error !== null && (error as { type?: unknown }).type === 'entity.too.large') {
    return { status: 413, body: { error: 'El cuerpo de la petición es demasiado grande' } };
  }

  switch (prismaCode(error)) {
    case 'P2002':
      return { status: 409, body: { error: 'Ya existe un registro con esos datos' } };
    case 'P2003':
      return { status: 409, body: { error: 'El registro está relacionado con otros datos y no se puede modificar' } };
    case 'P2025':
      return { status: 404, body: { error: 'El registro no existe' } };
    case undefined:
      break;
    default:
      return { status: 500, body: { error: 'Error al consultar la base de datos' } };
  }

  return { status: 500, body: { error: 'Error interno del servidor' } };
};

/**
 * Middleware de errores centralizado: todos los errores de controladores y middlewares terminan aquí.
 * Traduce cada error a su código HTTP y NUNCA devuelve el stack trace al cliente.
 */
export const errorMiddleware: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  const { status, body } = toResponse(error);
  if (status >= 500) {
    // El detalle se queda en el log del servidor, no en la respuesta
    console.error(error);
  }
  res.status(status).json(body);
};

/** Ninguna ruta coincidió: responde JSON en lugar del HTML por defecto de Express. */
export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: `La ruta ${req.method} ${req.path} no existe` });
};
