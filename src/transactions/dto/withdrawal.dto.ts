import { IsUUID } from 'class-validator';

import { CreateTransactionDto } from './create-transaction.dto';

export class WithdrawalDto extends CreateTransactionDto {
  @IsUUID()
  accountId: string;
}
