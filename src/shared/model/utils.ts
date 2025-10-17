export interface IPagination {
  page: number;
  take: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface IFilters {
  search?: string;
}

export type ValueOf<T> = T[keyof T];
