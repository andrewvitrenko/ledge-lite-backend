import type { Transaction } from '@/generated/prisma/client';

export class GetRecentTransactionsDto {
  data: Transaction[];
  total: number;
}
