import type { ProductCategory } from './Product.ts';
import type { PublicUser } from './User.ts';

/** Igual que en la Entrega 1: máximo 20 unidades por pedido. */
export const MAX_ORDER_QUANTITY = 20;

export type OrderStatus = 'PENDIENTE' | 'CONFIRMADO' | 'ENVIADO' | 'CANCELADO';

export interface OrderProduct {
  id: number;
  name: string;
  category: ProductCategory;
  image: string;
  imageAlt: string;
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  product: OrderProduct;
  /** Solo se incluye en el listado del administrador. */
  user?: PublicUser;
}

/** Lo que llega en el body de POST /api/orders. El usuario NO viene aquí: sale del token. */
export interface OrderInput {
  productId: number;
  quantity: number;
  customerName: string;
  customerEmail: string;
}

/** Lo que se guarda: el body validado + el usuario del token + el precio leído de la base de datos. */
export interface NewOrder extends OrderInput {
  userId: number;
  unitPrice: number;
  total: number;
}

export interface OrderFilters {
  /** Si viene, solo los pedidos de ese usuario (GET /api/orders/mias). */
  userId?: number;
  /** El administrador también ve los datos de quien hizo el pedido. */
  includeUser?: boolean;
}
