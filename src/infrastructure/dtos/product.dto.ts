import { IsIn, IsInt, IsNotEmpty, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { PRODUCT_CATEGORIES, type ProductCategory, type ProductInput } from '../../domain/models/Product.ts';
import { toRecord, trimmed } from './validate.ts';

const MAX_PRICE = 100_000_000;

/**
 * Body de POST y PUT /api/products (solo admin).
 * PUT reemplaza el producto completo, así que exige los mismos campos que POST.
 * El constructor copia SOLO los campos permitidos: lo demás que llegue (id, state...) se ignora.
 */
export class ProductDto implements ProductInput {
  @MaxLength(150, { message: 'El nombre no puede tener más de 150 caracteres' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsIn([...PRODUCT_CATEGORIES], { message: `La categoría debe ser una de: ${PRODUCT_CATEGORIES.join(', ')}` })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  category: ProductCategory;

  @MaxLength(1000, { message: 'La descripción no puede tener más de 1000 caracteres' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description: string;

  @Max(MAX_PRICE, { message: 'El precio no puede ser mayor a $100.000.000' })
  @Min(1, { message: 'El precio debe ser mayor a 0' })
  @IsInt({ message: 'El precio debe ser un número entero en pesos, sin decimales' })
  price: number;

  @Matches(/^(https?:\/\/\S+|\/\S+)$/, { message: 'La imagen debe ser una URL (https://...) o una ruta del sitio (/img/...)' })
  @MaxLength(500, { message: 'La ruta de la imagen no puede tener más de 500 caracteres' })
  @IsString({ message: 'La imagen debe ser un texto' })
  @IsNotEmpty({ message: 'La imagen es obligatoria' })
  image: string;

  @MaxLength(255, { message: 'El texto alternativo no puede tener más de 255 caracteres' })
  @MinLength(3, { message: 'El texto alternativo debe tener al menos 3 caracteres' })
  @IsString({ message: 'El texto alternativo debe ser un texto' })
  @IsNotEmpty({ message: 'El texto alternativo de la imagen es obligatorio' })
  imageAlt: string;

  constructor(body: unknown) {
    const payload = toRecord(body);
    this.name = trimmed(payload['name']) as string;
    this.category = trimmed(payload['category']) as ProductCategory;
    this.description = trimmed(payload['description']) as string;
    this.price = payload['price'] as number;
    this.image = trimmed(payload['image']) as string;
    this.imageAlt = trimmed(payload['imageAlt']) as string;
  }

  toInput(): ProductInput {
    return {
      name: this.name,
      category: this.category,
      description: this.description,
      price: this.price,
      image: this.image,
      imageAlt: this.imageAlt,
    };
  }
}
