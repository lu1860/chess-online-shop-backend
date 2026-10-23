import cors from 'cors';
import express, { type Express } from 'express';
import { env } from './infrastructure/config/env.ts';
import { errorMiddleware, notFoundHandler } from './interface/middlewares/error.handler.ts';
import authRoutes from './interface/routers/auth.router.ts';
import ordersRoutes from './interface/routers/orders.router.ts';
import productsRoutes from './interface/routers/products.router.ts';

const app: Express = express();
app.disable('x-powered-by');

// CORS solo para el frontend (Vercel y localhost), nunca "*"
app.use(cors({ origin: env.frontendOrigins }));
// Convierte el body JSON en req.body
app.use(express.json({ limit: '100kb' }));

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'API de ChessOnline Shop funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);

// Siempre al final: primero la ruta que no existe (404) y luego los errores
app.use(notFoundHandler);
app.use(errorMiddleware);

app.listen(env.port, () => {
  console.log(`API de ChessOnline Shop en http://localhost:${env.port}`);
});

export default app;
