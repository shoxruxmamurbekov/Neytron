/** Barcha muvaffaqiyatli javoblar uchun yagona konvert. */
export interface ApiResponse<T> {
  data: T;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PageMeta;
}

export function ok<T>(data: T): ApiResponse<T> {
  return { data };
}

export function paginated<T>(items: T[], meta: PageMeta): PaginatedResponse<T> {
  return { data: items, meta };
}
