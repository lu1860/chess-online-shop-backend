import type { Order, OrderInput } from '../domain/models/Order.ts';
import type { Paginated } from '../domain/models/Pagination.ts';
import type { AuthUser } from '../domain/models/User.ts';
import type { IOrderRepository } from '../domain/repository/IOrder.repository.ts';
import type { IProductRepository } from '../domain/repository/IProduct.repository.ts';
import { NotFoundError } from './errors/app.errors.ts';
import { toPageRequest, toPaginated, type PageParams } from './pagination.ts';

export class OrdersUseCase {
  private readonly orders: IOrderRepository;
  private readonly products: IProductRepository;

  constructor(orders: IOrderRepository, products: IProductRepository) {
    this.orders = orders;
    this.products = products;
  }

  /**
   * Crea el pedido a nombre del usuario del TOKEN (nunca de un userId del body).
   * El precio también sale de la base de datos: si viniera del body, cualquiera pagaría lo que quisiera.
   */
  async create(input: OrderInput, actor: AuthUser): Promise<Order> {
    const product = await this.products.findById(input.productId);
    if (!product) {
      throw new NotFoundError('El producto seleccionado no existe o ya no está disponible');
    }
    return this.orders.create({
      ...input,
      userId: actor.id,
      unitPrice: product.price,
      total: product.price * input.quantity,
    });
  }

  /** GET /api/orders/mias: solo los pedidos del usuario autenticado. */
  listMine(actor: AuthUser, page: PageParams): Promise<Paginated<Order>> {
    return this.list({ userId: actor.id }, page);
  }

  /** GET /api/orders: todos los pedidos, con el usuario que los hizo (solo admin). */
  listAll(page: PageParams): Promise<Paginated<Order>> {
    return this.list({ includeUser: true }, page);
  }

  private async list(filters: { userId?: number; includeUser?: boolean }, page: PageParams) {
    const result = await this.orders.findAll(filters, toPageRequest(page));
    return toPaginated(result, page);
  }
}
