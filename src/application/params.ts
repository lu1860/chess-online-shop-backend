import { BadRequestError } from './errors/app.errors.ts';

/** Valida el :id de la URL: debe ser un entero positivo. "abc", "0" o "1.5" → 400 */
export const parseId = (value: unknown, name = 'id'): number => {
  const number = Number(value);
  if (typeof value !== 'string' || value.trim() === '' || !Number.isInteger(number) || number < 1) {
    throw new BadRequestError(`El parámetro ${name} debe ser un entero positivo`, { [name]: 'Debe ser un entero positivo' });
  }
  return number;
};
