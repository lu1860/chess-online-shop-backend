import type { Request, Response } from 'express';
import type { OrdersUseCase } from '../../application/orders.use-case.ts';
import { parsePagination } from '../../application/pagination.ts';
import { OrderDto } from '../../infrastructure/dtos/order.dto.ts';
import { validateDto } from '../../infrastructure/dtos/validate.ts';
import { getAuthUser } from '../middlewares/auth.middleware.ts';

export class OrdersController {
  private readonly orders: OrdersUseCase;

  constructor(orders: OrdersUseCase) {
    this.orders = orders;
  }

  // POST /api/orders (autenticado) → el pedido queda a nombre del usuario del token
  create = async (req: Request, res: Response): Promise<void> => {
    const dto = await validateDto(new OrderDto(req.body));
    const order = await this.orders.create(dto.toInput(), getAuthUser(req));
    res.status(201).json({ message: 'Pedido registrado', data: order });
  };

  // GET /api/orders/mias (autenticado) → solo los pedidos del usuario del token
  listMine = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as Record<string, unknown>;
    const page = parsePagination(query['page'], query['limit']);
    res.status(200).json(await this.orders.listMine(getAuthUser(req), page));
  };

  // GET /api/orders (admin) → todos los pedidos
  listAll = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as Record<string, unknown>;
    const page = parsePagination(query['page'], query['limit']);
    res.status(200).json(await this.orders.listAll(page));
  };
}
