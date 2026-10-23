/** Puerto para cifrar y comparar contraseñas. La implementación (bcrypt) vive en infrastructure. */
export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
