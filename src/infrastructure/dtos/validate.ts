import { validate, type ValidationError } from 'class-validator';
import { BadRequestError, type FieldErrors } from '../../application/errors/app.errors.ts';

/** El body puede llegar vacío, como texto o como arreglo: se normaliza a un objeto. */
export const toRecord = (body: unknown): Record<string, unknown> =>
  body !== null && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};

export const trimmed = (value: unknown): unknown => (typeof value === 'string' ? value.trim() : value);

/**
 * Valida el DTO con class-validator. Si hay errores lanza BadRequestError (400) con
 * un mapa { campo: mensaje } para que el frontend pinte cada error junto a su campo.
 */
export const validateDto = async <T extends object>(dto: T): Promise<T> => {
  const errors: ValidationError[] = await validate(dto, { stopAtFirstError: true });
  if (errors.length > 0) {
    const fields: FieldErrors = {};
    for (const error of errors) {
      fields[error.property] = Object.values(error.constraints ?? {})[0] ?? 'Valor no válido';
    }
    throw new BadRequestError('Revisa los datos enviados', fields);
  }
  return dto;
};
