import { PRODUCT_CATEGORIES, type ProductCategory, type ProductFilters } from '../domain/models/Product.ts';
import { BadRequestError } from './errors/app.errors.ts';

const MAX_SEARCH_LENGTH = 100;

const toOptionalPrice = (value: unknown, name: string): number | undefined => {
  if (value === undefined || value === '') return undefined;
  const number = Number(value);
  if (typeof value !== 'string' || !Number.isInteger(number) || number < 0) {
    throw new BadRequestError(`${name} debe ser un entero mayor o igual a 0`, { [name]: 'Debe ser un entero mayor o igual a 0' });
  }
  return number;
};

const isCategory = (value: string): value is ProductCategory =>
  (PRODUCT_CATEGORIES as readonly string[]).includes(value);

/** Lee los filtros opcionales y combinables del catálogo: ?q=&category=&minPrice=&maxPrice= */
export const parseProductFilters = (query: Record<string, unknown>): ProductFilters => {
  const filters: ProductFilters = {};

  if (query['q'] !== undefined) {
    if (typeof query['q'] !== 'string') {
      throw new BadRequestError('q debe ser un texto', { q: 'Debe ser un texto' });
    }
    const q = query['q'].trim();
    if (q.length > MAX_SEARCH_LENGTH) {
      throw new BadRequestError(`q no puede tener más de ${MAX_SEARCH_LENGTH} caracteres`, { q: `Máximo ${MAX_SEARCH_LENGTH} caracteres` });
    }
    if (q) filters.q = q;
  }

  const category = query['category'];
  if (category !== undefined && category !== '' && category !== 'todos') {
    if (typeof category !== 'string' || !isCategory(category)) {
      throw new BadRequestError(`category debe ser una de: ${PRODUCT_CATEGORIES.join(', ')}`, { category: 'Categoría no válida' });
    }
    filters.category = category;
  }

  const minPrice = toOptionalPrice(query['minPrice'], 'minPrice');
  const maxPrice = toOptionalPrice(query['maxPrice'], 'maxPrice');
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new BadRequestError('minPrice no puede ser mayor que maxPrice', { minPrice: 'No puede ser mayor que el precio máximo' });
  }
  if (minPrice !== undefined) filters.minPrice = minPrice;
  if (maxPrice !== undefined) filters.maxPrice = maxPrice;

  return filters;
};
