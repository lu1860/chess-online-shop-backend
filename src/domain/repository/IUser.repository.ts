import type { NewUser, User } from '../models/User.ts';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(user: NewUser): Promise<User>;
}
