import { IsUUID } from 'class-validator';

import { CreateTransactionDto } from './create-transaction.dto';

export class TransferDto extends CreateTransactionDto {
  @IsUUID()
  sourceId: string;

  @IsUUID()
  destinationId: string;
}
