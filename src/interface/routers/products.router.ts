import { Router } from 'express';
import { ProductsUseCase } from '../../application/products.use-case.ts';
import { ProductsPgRepository } from '../../infrastructure/repository/products.pg.repository.ts';
import { ProductsController } from '../controllers/products.controller.ts';
import { authenticate, soloAdmin } from '../middlewares/auth.middleware.ts';

const controller = new ProductsController(new ProductsUseCase(new ProductsPgRepository()));

const router: Router = Router();

// Consultar el catálogo es público
router.get('/', controller.list);
router.get('/:id', controller.getById);

// Modificarlo exige sesión (401) y rol admin (403)
router.post('/', authenticate, soloAdmin, controller.create);
router.put('/:id', authenticate, soloAdmin, controller.update);
router.delete('/:id', authenticate, soloAdmin, controller.remove);

export default router;
