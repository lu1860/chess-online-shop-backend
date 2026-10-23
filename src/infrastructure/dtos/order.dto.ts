import { IsEmail, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { MAX_ORDER_QUANTITY, type OrderInput } from '../../domain/models/Order.ts';
import { toRecord, trimmed } from './validate.ts';

/**
 * Body de POST /api/orders: los mismos campos del formulario de la Entrega 1.
 * Si llega un userId o un precio en el body se ignoran: el usuario sale del token y el precio de la base de datos.
 */
export class OrderDto implements OrderInput {
  @Min(1, { message: 'Selecciona el producto que quieres pedir' })
  @IsInt({ message: 'Selecciona el producto que quieres pedir' })
  productId: number;

  @Max(MAX_ORDER_QUANTITY, { message: `La cantidad máxima por pedido es ${MAX_ORDER_QUANTITY}` })
  @Min(1, { message: 'La cantidad mínima es 1' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  quantity: number;

  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  customerName: string;

  @MaxLength(150, { message: 'El correo no puede tener más de 150 caracteres' })
  @IsEmail({}, { message: 'Escribe un correo válido, por ejemplo: nombre@correo.com' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  customerEmail: string;

  constructor(body: unknown) {
    const payload = toRecord(body);
    this.productId = payload['productId'] as number;
    this.quantity = payload['quantity'] as number;
    this.customerName = trimmed(payload['customerName']) as string;
    this.customerEmail = trimmed(payload['customerEmail']) as string;
  }

  toInput(): OrderInput {
    return {
      productId: this.productId,
      quantity: this.quantity,
      customerName: this.customerName,
      customerEmail: this.customerEmail,
    };
  }
}
