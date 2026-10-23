import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // npx prisma db seed → carga los productos de la Entrega 1 y los usuarios de prueba
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Sin env() estricto: "prisma generate" (en el build) no necesita la base de datos.
    // migrate y seed sí la usan, y fallan con un mensaje claro si DATABASE_URL está vacía.
    url: process.env["DATABASE_URL"] ?? "",
  },
});
