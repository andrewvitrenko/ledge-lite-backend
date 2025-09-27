import { Transaction } from '@prisma/client';

export class GetRecentTransactionsDto {
  data: Transaction[];
  total: number;
}
