import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';
import { env } from '../config/env.ts';

// Única instancia de Prisma de toda la API. Solo la capa infrastructure la importa.
const adapter = new PrismaPg({ connectionString: env.databaseUrl });
const prisma = new PrismaClient({ adapter });

export default prisma;
