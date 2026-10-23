import type { Paginated } from '../domain/models/Pagination.ts';
import type { Product, ProductFilters, ProductInput } from '../domain/models/Product.ts';
import type { IProductRepository } from '../domain/repository/IProduct.repository.ts';
import { NotFoundError } from './errors/app.errors.ts';
import { toPageRequest, toPaginated, type PageParams } from './pagination.ts';

const NOT_FOUND = 'El producto no existe';

export class ProductsUseCase {
  private readonly products: IProductRepository;

  constructor(products: IProductRepository) {
    this.products = products;
  }

  async list(filters: ProductFilters, page: PageParams): Promise<Paginated<Product>> {
    const result = await this.products.findAll(filters, toPageRequest(page));
    return toPaginated(result, page);
  }

  async getById(id: number): Promise<Product> {
    const product = await this.products.findById(id);
    if (!product) throw new NotFoundError(NOT_FOUND);
    return product;
  }

  create(input: ProductInput): Promise<Product> {
    return this.products.create(input);
  }

  async update(id: number, input: ProductInput): Promise<Product> {
    await this.getById(id); // 404 si no existe o ya fue eliminado
    return this.products.update(id, input);
  }

  async remove(id: number): Promise<void> {
    await this.getById(id);
    await this.products.softDelete(id);
  }
}
