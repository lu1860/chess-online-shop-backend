import type { Request, Response } from 'express';
import type { AuthUseCase } from '../../application/auth.use-case.ts';
import { LoginDto, RegisterDto } from '../../infrastructure/dtos/auth.dto.ts';
import { validateDto } from '../../infrastructure/dtos/validate.ts';
import { getAuthUser } from '../middlewares/auth.middleware.ts';

// Express 5 envía al middleware de errores cualquier error de un controlador async: no hace falta try/catch.
export class AuthController {
  private readonly auth: AuthUseCase;

  constructor(auth: AuthUseCase) {
    this.auth = auth;
  }

  // POST /api/auth/register → 201
  register = async (req: Request, res: Response): Promise<void> => {
    const dto = await validateDto(new RegisterDto(req.body));
    const user = await this.auth.register(dto);
    res.status(201).json({ message: 'Cuenta creada. Ya puedes iniciar sesión', data: user });
  };

  // POST /api/auth/login → 200 { data: { user, token } }
  login = async (req: Request, res: Response): Promise<void> => {
    const dto = await validateDto(new LoginDto(req.body));
    const result = await this.auth.login(dto);
    res.status(200).json({ data: result });
  };

  // GET /api/auth/me → usuario del token (requiere authenticate)
  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.auth.profile(getAuthUser(req).id);
    res.status(200).json({ data: user });
  };
}
