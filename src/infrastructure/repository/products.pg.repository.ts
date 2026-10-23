import type { PageRequest, PageResult } from '../../domain/models/Pagination.ts';
import type { Product, ProductFilters, ProductInput } from '../../domain/models/Product.ts';
import type { IProductRepository } from '../../domain/repository/IProduct.repository.ts';
import type { Prisma, products } from '../../generated/prisma/client.ts';
import prisma from './client.ts';

const ACTIVE = 'ACTIVE';

export class ProductsPgRepository implements IProductRepository {
  async findAll(filters: ProductFilters, page: PageRequest): Promise<PageResult<Product>> {
    // Los filtros son opcionales y combinables: solo se agregan al where si vienen
    const where: Prisma.productsWhereInput = {
      state: ACTIVE,
      ...(filters.category && { category: filters.category }),
      ...(filters.q && {
        OR: [
          { name: { contains: filters.q, mode: 'insensitive' } },
          { description: { contains: filters.q, mode: 'insensitive' } },
        ],
      }),
      ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
        price: {
          ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
          ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
        },
      }),
    };

    const [total, rows] = await prisma.$transaction([
      prisma.products.count({ where }),
      prisma.products.findMany({
        where,
        // Orden determinista: sin él, la base puede repetir o saltarse filas entre páginas
        orderBy: { id: 'asc' },
        take: page.limit,
        skip: page.offset,
      }),
    ]);
    return { data: rows.map((row) => this.toDomain(row)), total };
  }

  async findById(id: number): Promise<Product | null> {
    // findFirst y no findUnique porque también se filtra por state
    const row = await prisma.products.findFirst({ where: { id, state: ACTIVE } });
    return row ? this.toDomain(row) : null;
  }

  async create(product: ProductInput): Promise<Product> {
    const row = await prisma.products.create({ data: this.toRow(product) });
    return this.toDomain(row);
  }

  async update(id: number, product: ProductInput): Promise<Product> {
    const row = await prisma.products.update({ where: { id }, data: this.toRow(product) });
    return this.toDomain(row);
  }

  async softDelete(id: number): Promise<void> {
    await prisma.products.update({
      where: { id },
      data: { state: 'REMOVED', deleted_at: new Date() },
    });
  }

  private toRow(product: ProductInput) {
    return {
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      image: product.image,
      image_alt: product.imageAlt,
    };
  }

  private toDomain(row: products): Product {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      price: row.price,
      image: row.image,
      imageAlt: row.image_alt,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
