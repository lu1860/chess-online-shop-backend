import type { PublicUser, User } from '../domain/models/User.ts';

// El repositorio devuelve el hash de la contraseña porque el login lo necesita,
// pero nunca debe salir en una respuesta de la API.
export const toPublicUser = ({ id, name, email, role }: User): PublicUser => ({ id, name, email, role });
