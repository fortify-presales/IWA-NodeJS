export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export function paginate(page: number, size: number): { limit: number; offset: number } {
  return { limit: size, offset: (page - 1) * size };
}

export function buildPaginationMeta(page: number, size: number, total: number): PaginationMeta {
  return { page, size, total, totalPages: Math.ceil(total / size) };
}
