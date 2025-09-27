export interface IPagination {
  page: number;
  take: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
}
