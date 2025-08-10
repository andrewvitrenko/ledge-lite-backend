export interface GetExchangeRateResponse {
  success: true;
  historical: true;
  date: string;
  timestamp: number;
  base: string;
  rates: Record<string, number>;
}
