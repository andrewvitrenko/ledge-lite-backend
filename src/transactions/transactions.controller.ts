import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { UseJwtGuard } from '@/auth/guards/jwt-auth.guard';
import { UseUserData } from '@/shared/decorators/use-user-data';

import { DepositDto } from './dto/deposit.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { UseAccountOwnershipGuard } from './guards/account-ownership.guard';
import { UseCategoryOwnershipGuard } from './guards/category-ownership.guard';
import { TransactionsService } from './transactions.service';

@UseJwtGuard()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseAccountOwnershipGuard()
  @UseCategoryOwnershipGuard()
  @Post('/deposit')
  deposit(@UseUserData('id') userId: string, @Body() depositDto: DepositDto) {
    return this.transactionsService.deposit(userId, depositDto);
  }

  @UseAccountOwnershipGuard()
  @UseCategoryOwnershipGuard()
  @Post('/withdrawal')
  withdrawal(
    @UseUserData('id') userId: string,
    @Body() withdrawalDto: WithdrawalDto,
  ) {
    return this.transactionsService.withdrawal(userId, withdrawalDto);
  }

  @Delete('/withdrawal/:id')
  deleteWithdrawal(
    @UseUserData('id') userId: string,
    @Param('id', ParseUUIDPipe) withdrawalId: string,
  ) {
    return this.transactionsService.deleteWithdrawal(userId, withdrawalId);
  }

  @Delete('/deposit/:id')
  deleteDeposit(
    @UseUserData('id') userId: string,
    @Param('id', ParseUUIDPipe) depositId: string,
  ) {
    return this.transactionsService.deleteDeposit(userId, depositId);
  }

  @UseCategoryOwnershipGuard()
  @Patch('/:id')
  updateTransaction(
    @UseUserData('id') userId: string,
    @Param('id', ParseUUIDPipe) transactionId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.updateTransaction(
      userId,
      transactionId,
      updateTransactionDto,
    );
  }
}
