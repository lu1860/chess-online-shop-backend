import type { Request, Response } from 'express';
import { parsePagination } from '../../application/pagination.ts';
import { parseId } from '../../application/params.ts';
import { parseProductFilters } from '../../application/product-filters.ts';
import type { ProductsUseCase } from '../../application/products.use-case.ts';
import { ProductDto } from '../../infrastructure/dtos/product.dto.ts';
import { validateDto } from '../../infrastructure/dtos/validate.ts';

export class ProductsController {
  private readonly products: ProductsUseCase;

  constructor(products: ProductsUseCase) {
    this.products = products;
  }

  // GET /api/products?page=&limit=&q=&category=&minPrice=&maxPrice= → { pagination, data }
  list = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as Record<string, unknown>;
    const page = parsePagination(query['page'], query['limit']);
    const filters = parseProductFilters(query);
    res.status(200).json(await this.products.list(filters, page));
  };

  // GET /api/products/:id
  getById = async (req: Request, res: Response): Promise<void> => {
    const product = await this.products.getById(parseId(req.params['id']));
    res.status(200).json({ data: product });
  };

  // POST /api/products (admin) → 201
  create = async (req: Request, res: Response): Promise<void> => {
    const dto = await validateDto(new ProductDto(req.body));
    const product = await this.products.create(dto.toInput());
    res.status(201).json({ message: 'Producto creado', data: product });
  };

  // PUT /api/products/:id (admin) → reemplaza el producto completo
  update = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params['id']);
    const dto = await validateDto(new ProductDto(req.body));
    const product = await this.products.update(id, dto.toInput());
    res.status(200).json({ message: 'Producto actualizado', data: product });
  };

  // DELETE /api/products/:id (admin)
  remove = async (req: Request, res: Response): Promise<void> => {
    await this.products.remove(parseId(req.params['id']));
    res.status(200).json({ message: 'Producto eliminado' });
  };
}
