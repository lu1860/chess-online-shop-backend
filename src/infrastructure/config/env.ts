import 'dotenv/config';

/**
 * Variables de entorno de la API, leídas y validadas en un solo lugar.
 * Si falta una obligatoria, la API no arranca: es mejor fallar al iniciar que firmar tokens con un secreto vacío.
 */
const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa el archivo .env (usa .env.example como guía).`);
  }
  return value;
};

// jsonwebtoken acepta segundos (número) o un texto con unidad: "15m", "2h", "1d"
const DURATION = /^\d+\s?(ms|s|m|h|d|w|y)$/i;
const parseExpiresIn = (value: string): number | string => {
  if (/^\d+$/.test(value)) return Number(value);
  if (DURATION.test(value)) return value.replace(/\s/g, '');
  throw new Error(`JWT_EXPIRES_IN no es válido ("${value}"). Usa segundos (3600) o un valor como 15m, 2h o 1d.`);
};

const parseOrigins = (value: string | undefined): string[] =>
  (value ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

export const env = {
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: parseExpiresIn(process.env['JWT_EXPIRES_IN']?.trim() || '2h'),
  port: Number(process.env['PORT']) || 3001,
  frontendOrigins: parseOrigins(process.env['FRONTEND_URL']),
} as const;
