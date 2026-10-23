import { Router } from 'express';
import { AuthUseCase } from '../../application/auth.use-case.ts';
import { UsersPgRepository } from '../../infrastructure/repository/users.pg.repository.ts';
import { BcryptService } from '../../infrastructure/services/bcrypt.service.ts';
import { JwtService } from '../../infrastructure/services/jwt.service.ts';
import { AuthController } from '../controllers/auth.controller.ts';
import { authenticate } from '../middlewares/auth.middleware.ts';

// Inyección de dependencias: el caso de uso recibe las implementaciones de infrastructure
const controller = new AuthController(new AuthUseCase(new UsersPgRepository(), new BcryptService(), new JwtService()));

const router: Router = Router();

// Públicas
router.post('/register', controller.register);
router.post('/login', controller.login);

// Protegida: devuelve el usuario del token. Sin token o con token inválido → 401
router.get('/me', authenticate, controller.me);

export default router;
