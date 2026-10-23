export const PRODUCT_CATEGORIES = ['tableros', 'piezas', 'relojes', 'libros'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** Producto del catálogo (camelCase, independiente de las columnas de la tabla). */
export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  description: string;
  /** Precio en pesos colombianos, sin decimales. */
  price: number;
  /** Ruta del frontend (/img/...) o URL absoluta de la imagen. */
  image: string;
  imageAlt: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Lo que el administrador escribe al crear o reemplazar un producto. */
export interface ProductInput {
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  image: string;
  imageAlt: string;
}

/** Filtros combinables del listado: ?q=&category=&minPrice=&maxPrice= */
export interface ProductFilters {
  q?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
}
