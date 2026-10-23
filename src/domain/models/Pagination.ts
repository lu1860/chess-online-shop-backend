/** Lo que la base de datos entiende: cuántos traer y desde dónde. */
export interface PageRequest {
  limit: number;
  offset: number;
}

/** Lo que devuelve un repositorio al listar. */
export interface PageResult<T> {
  data: T[];
  total: number;
}

/** Respuesta paginada de la API: { pagination, data } */
export interface Paginated<T> {
  pagination: {
    total: number;
    currentPage: number;
    limit: number;
    totalPages: number;
  };
  data: T[];
}
