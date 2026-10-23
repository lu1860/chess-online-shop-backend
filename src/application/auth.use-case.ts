import type { AuthResponse, LoginInput, PublicUser, RegisterInput } from '../domain/models/User.ts';
import type { IUserRepository } from '../domain/repository/IUser.repository.ts';
import type { IPasswordHasher } from '../domain/services/IPasswordHasher.ts';
import type { ITokenService } from '../domain/services/ITokenService.ts';
import { ConflictError, UnauthorizedError } from './errors/app.errors.ts';
import { toPublicUser } from './user-mapper.ts';

// Un único mensaje para email inexistente y contraseña incorrecta:
// así la API no le confirma a un atacante qué correos están registrados.
const INVALID_CREDENTIALS = 'Correo o contraseña incorrectos';
const EMAIL_TAKEN = 'Ya existe una cuenta con este correo';

export class AuthUseCase {
  private readonly users: IUserRepository;
  private readonly hasher: IPasswordHasher;
  private readonly tokens: ITokenService;

  constructor(users: IUserRepository, hasher: IPasswordHasher, tokens: ITokenService) {
    this.users = users;
    this.hasher = hasher;
    this.tokens = tokens;
  }

  async register(input: RegisterInput): Promise<PublicUser> {
    const email = input.email.toLowerCase();
    if (await this.users.findByEmail(email)) {
      throw new ConflictError(EMAIL_TAKEN, { email: EMAIL_TAKEN });
    }
    const user = await this.users.create({
      name: input.name,
      email,
      passwordHash: await this.hasher.hash(input.password),
      // El rol NUNCA viene del body: quien se registra es siempre "user".
      // Los administradores se crean con el seed.
      role: 'user',
    });
    return toPublicUser(user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.users.findByEmail(input.email.toLowerCase());
    // Usuario inexistente, inactivo o contraseña incorrecta: siempre la misma respuesta
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedError(INVALID_CREDENTIALS);
    }
    const isValid = await this.hasher.compare(input.password, user.password);
    if (!isValid) {
      throw new UnauthorizedError(INVALID_CREDENTIALS);
    }
    return {
      user: toPublicUser(user),
      token: this.tokens.generate({ id: user.id, role: user.role }),
    };
  }

  /** Perfil del usuario del token. Si fue borrado o desactivado, el token deja de servir → 401. */
  async profile(userId: number): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Tu sesión ya no es válida. Inicia sesión de nuevo');
    }
    return toPublicUser(user);
  }
}
