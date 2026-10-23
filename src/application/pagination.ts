import type { PageRequest, Paginated, PageResult } from '../domain/models/Pagination.ts';
import { BadRequestError } from './errors/app.errors.ts';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export interface PageParams {
  page: number;
  limit: number;
}

// Los parámetros de query siempre llegan como texto. Si no vienen se usa el valor por defecto;
// si vienen mal (0, -1, "abc", 1.5) se responde 400 en lugar de mandarle basura a la base de datos.
const toPositiveInt = (value: unknown, name: string, defaultValue: number): number => {
  if (value === undefined || value === '') return defaultValue;
  const number = Number(value);
  if (typeof value !== 'string' || !Number.isInteger(number) || number < 1) {
    throw new BadRequestError(`${name} debe ser un entero mayor o igual a 1`, { [name]: `${name} debe ser un entero mayor o igual a 1` });
  }
  return number;
};

export const parsePagination = (page: unknown, limit: unknown): PageParams => {
  const parsedLimit = toPositiveInt(limit, 'limit', DEFAULT_LIMIT);
  if (parsedLimit > MAX_LIMIT) {
    throw new BadRequestError(`limit no puede ser mayor a ${MAX_LIMIT}`, { limit: `limit no puede ser mayor a ${MAX_LIMIT}` });
  }
  return { page: toPositiveInt(page, 'page', 1), limit: parsedLimit };
};

/** El cliente piensa en páginas; la base de datos en limit/offset. offset = limit * (page - 1) */
export const toPageRequest = ({ page, limit }: PageParams): PageRequest => ({
  limit,
  offset: limit * (page - 1),
});

export const toPaginated = <T>({ data, total }: PageResult<T>, { page, limit }: PageParams): Paginated<T> => ({
  pagination: {
    total,
    currentPage: page,
    limit,
    totalPages: Math.ceil(total / limit),
  },
  data,
});
