import type { PageRequest, PageResult } from '../models/Pagination.ts';
import type { Product, ProductFilters, ProductInput } from '../models/Product.ts';

export interface IProductRepository {
  findAll(filters: ProductFilters, page: PageRequest): Promise<PageResult<Product>>;
  /** Devuelve null si no existe o si fue eliminado (state REMOVED). */
  findById(id: number): Promise<Product | null>;
  create(product: ProductInput): Promise<Product>;
  update(id: number, product: ProductInput): Promise<Product>;
  /** Borrado lógico: cambia state a REMOVED y registra deleted_at. */
  softDelete(id: number): Promise<void>;
}
