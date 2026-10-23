import type { NewOrder, Order, OrderFilters, OrderStatus } from '../../domain/models/Order.ts';
import type { PageRequest, PageResult } from '../../domain/models/Pagination.ts';
import type { IOrderRepository } from '../../domain/repository/IOrder.repository.ts';
import type { orders, products, users } from '../../generated/prisma/client.ts';
import prisma from './client.ts';

type OrderRow = orders & { products: products; users?: users };

const STATUSES: readonly OrderStatus[] = ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'CANCELADO'];

export class OrdersPgRepository implements IOrderRepository {
  async create(order: NewOrder): Promise<Order> {
    const row = await prisma.orders.create({
      data: {
        user_id: order.userId,
        product_id: order.productId,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        quantity: order.quantity,
        unit_price: order.unitPrice,
        total: order.total,
      },
      include: { products: true },
    });
    return this.toDomain(row);
  }

  async findAll(filters: OrderFilters, page: PageRequest): Promise<PageResult<Order>> {
    const where = filters.userId !== undefined ? { user_id: filters.userId } : {};
    const [total, rows] = await prisma.$transaction([
      prisma.orders.count({ where }),
      prisma.orders.findMany({
        where,
        include: { products: true, users: filters.includeUser === true },
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        take: page.limit,
        skip: page.offset,
      }),
    ]);
    return { data: rows.map((row) => this.toDomain(row)), total };
  }

  private toDomain(row: OrderRow): Order {
    const status = STATUSES.find((value) => value === row.status) ?? 'PENDIENTE';
    return {
      id: row.id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      total: row.total,
      status,
      createdAt: row.created_at,
      product: {
        id: row.products.id,
        name: row.products.name,
        category: row.products.category,
        image: row.products.image,
        imageAlt: row.products.image_alt,
      },
      // Del usuario solo salen datos públicos: nunca el hash de la contraseña
      ...(row.users && {
        user: { id: row.users.id, name: row.users.name, email: row.users.email, role: row.users.role },
      }),
    };
  }
}
