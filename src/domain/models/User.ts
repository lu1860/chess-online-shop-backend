export const USER_ROLES = ['admin', 'user'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type UserStatus = 'ACTIVE' | 'INACTIVE';

/** Usuario completo, tal como lo devuelve el repositorio (incluye el hash de la contraseña). */
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}

/** Lo que sí puede salir en una respuesta de la API: nunca la contraseña. */
export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;

/**
 * Datos que viajan dentro del JWT y quedan en req.user.
 * Solo id y role: el payload de un JWT se puede leer sin la clave, así que no lleva nada sensible.
 */
export interface AuthUser {
  id: number;
  role: UserRole;
}

export interface NewUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  tokenType: 'Bearer';
  /** Segundos de vida del token desde que se emitió. */
  expiresIn: number;
}

export interface AuthResponse {
  user: PublicUser;
  token: AuthToken;
}
