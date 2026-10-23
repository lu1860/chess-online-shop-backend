import bcrypt from 'bcrypt';
import type { IPasswordHasher } from '../../domain/services/IPasswordHasher.ts';

// Costo del hash: cada +1 duplica el tiempo de cálculo. 10 es el valor recomendado para una API web.
const SALT_ROUNDS = 10;

export class BcryptService implements IPasswordHasher {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
