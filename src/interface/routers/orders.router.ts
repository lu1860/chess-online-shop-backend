import { Router } from 'express';
import { OrdersUseCase } from '../../application/orders.use-case.ts';
import { OrdersPgRepository } from '../../infrastructure/repository/orders.pg.repository.ts';
import { ProductsPgRepository } from '../../infrastructure/repository/products.pg.repository.ts';
import { OrdersController } from '../controllers/orders.controller.ts';
import { authenticate, soloAdmin } from '../middlewares/auth.middleware.ts';

const controller = new OrdersController(new OrdersUseCase(new OrdersPgRepository(), new ProductsPgRepository()));

const router: Router = Router();

// Todas las rutas de pedidos exigen sesión: el middleware se aplica una vez para todo el router
router.use(authenticate);

router.post('/', controller.create);
router.get('/mias', controller.listMine);
router.get('/', soloAdmin, controller.listAll);

export default router;
