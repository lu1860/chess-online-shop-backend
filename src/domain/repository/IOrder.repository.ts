import type { NewOrder, Order, OrderFilters } from '../models/Order.ts';
import type { PageRequest, PageResult } from '../models/Pagination.ts';

export interface IOrderRepository {
  create(order: NewOrder): Promise<Order>;
  findAll(filters: OrderFilters, page: PageRequest): Promise<PageResult<Order>>;
}
