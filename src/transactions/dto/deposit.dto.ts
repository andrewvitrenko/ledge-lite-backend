import { IsUUID } from 'class-validator';

import { CreateTransactionDto } from './create-transaction.dto';

export class DepositDto extends CreateTransactionDto {
  @IsUUID()
  accountId: string;
}
