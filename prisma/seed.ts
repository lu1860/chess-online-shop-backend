/**
 * Carga inicial de datos: npx prisma db seed
 *  - Los 7 productos reales del arreglo "productos" de la Entrega 1 (main.js).
 *  - Un usuario admin y un usuario user para probar los roles (credenciales en el README).
 * Se puede ejecutar varias veces: los usuarios se actualizan y los productos solo se insertan si la tabla está vacía.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { PrismaClient, type product_category } from '../src/generated/prisma/client.ts';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] ?? '' }) });

const TEST_USERS = [
  { name: 'Administrador ChessOnline', email: 'admin@chessonline.shop', password: 'Admin2026!', role: 'admin' as const },
  { name: 'Cliente de Prueba', email: 'cliente@chessonline.shop', password: 'Cliente2026!', role: 'user' as const },
];

// Mismo contenido que el arreglo de la Entrega 1. Las imágenes viven en /public/img del frontend.
const PRODUCTS: {
  name: string;
  category: product_category;
  description: string;
  price: number;
  image: string;
  image_alt: string;
}[] = [
  {
    name: 'Tablero de Ajedrez de Madera',
    category: 'tableros',
    description: 'Tablero de ajedrez de madera de muy alta calidad, con casillas de 55 mm y acabado encerado.',
    price: 150000,
    image: '/img/tablero-madera.jpg',
    image_alt: 'Tablero de ajedrez de madera',
  },
  {
    name: 'Piezas Staunton',
    category: 'piezas',
    description: 'Juego de piezas torneadas en modelo Staunton con acabado mate y base afelpada.',
    price: 65000,
    image: '/img/piezas-staunton.jpg',
    image_alt: 'Piezas de ajedrez Staunton torneadas',
  },
  {
    name: 'Piezas Madera Artesanal',
    category: 'piezas',
    description: 'Piezas talladas a mano en madera de ébano y boj. Diseño clásico Staunton.',
    price: 120000,
    image: '/img/piezas-madera.jpg',
    image_alt: 'Piezas de ajedrez de madera talladas a mano',
  },
  {
    name: 'Reloj Digital DGT',
    category: 'relojes',
    description: 'Reloj digital profesional con display LCD, modos de juego y alerta sonora. Aprobado por la FIDE.',
    price: 200000,
    image: '/img/reloj-digital.jpg',
    image_alt: 'Reloj de ajedrez digital con display LCD',
  },
  {
    name: 'Reloj Analógico Clásico',
    category: 'relojes',
    description: 'Reloj mecánico tradicional con diseño vintage. Mecanismo de precisión y tapa protectora.',
    price: 100000,
    image: '/img/reloj-analogico.jpg',
    image_alt: 'Reloj de ajedrez analógico clásico',
  },
  {
    name: 'Aperturas Modernas',
    category: 'libros',
    description: 'Guía completa de aperturas contemporáneas con análisis de Grandes Maestros. Nivel intermedio-avanzado.',
    price: 39990,
    image: '/img/libro-aperturas.jpg',
    image_alt: 'Libro de ajedrez sobre aperturas modernas',
  },
  {
    name: 'Estrategia y Táctica',
    category: 'libros',
    description: 'Manual de estrategia posicional y combinaciones tácticas. Ejercicios prácticos incluidos.',
    price: 55990,
    image: '/img/libro-estrategia.jpg',
    image_alt: 'Libro de estrategia y táctica de ajedrez',
  },
];

async function main() {
  for (const user of TEST_USERS) {
    const password = await bcrypt.hash(user.password, 10);
    await prisma.users.upsert({
      where: { email: user.email },
      update: { name: user.name, password, role: user.role, status: 'ACTIVE' },
      create: { name: user.name, email: user.email, password, role: user.role },
    });
  }
  console.log(`Usuarios de prueba listos: ${TEST_USERS.map((user) => `${user.email} (${user.role})`).join(', ')}`);

  const existing = await prisma.products.count();
  if (existing === 0) {
    await prisma.products.createMany({ data: PRODUCTS });
    console.log(`Productos cargados: ${PRODUCTS.length}`);
  } else {
    console.log(`La tabla products ya tiene ${existing} registros: no se insertan productos.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
