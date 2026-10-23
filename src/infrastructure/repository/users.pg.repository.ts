import type { NewUser, User } from '../../domain/models/User.ts';
import type { IUserRepository } from '../../domain/repository/IUser.repository.ts';
import type { users } from '../../generated/prisma/client.ts';
import prisma from './client.ts';

export class UsersPgRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.users.findUnique({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: number): Promise<User | null> {
    const row = await prisma.users.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async create(user: NewUser): Promise<User> {
    const row = await prisma.users.create({
      data: { name: user.name, email: user.email, password: user.passwordHash, role: user.role },
    });
    return this.toDomain(row);
  }

  // Fila de la tabla (snake_case) → modelo de dominio (camelCase)
  private toDomain(row: users): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role,
      status: row.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      createdAt: row.created_at,
    };
  }
}
