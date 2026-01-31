import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/client';

import { AccountsService } from '@/accounts/accounts.service';
import { Deposit, Transaction, Withdrawal } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import { DepositDto } from './dto/deposit.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { WithdrawalDto } from './dto/withdrawal.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly accountsService: AccountsService,
  ) {}

  public async deposit(
    userId: string,
    { accountId, ...transactionData }: DepositDto,
  ): Promise<Deposit> {
    console.log(transactionData);
    const account = await this.accountsService.getById(accountId);

    if (!account) {
      throw new BadRequestException('Account does not exist');
    }

    return this.prismaService.$transaction(async (ctx) => {
      const transaction = await ctx.transaction.create({
        data: {
          userId,
          ...transactionData,
        },
      });

      await ctx.account.update({
        where: { id: accountId },
        data: { balance: { increment: transactionData.amount } },
      });

      const deposit = await ctx.deposit.create({
        data: { accountId, transactionId: transaction.id },
      });

      return deposit;
    });
  }

  public async withdrawal(
    userId: string,
    { accountId, ...transactionData }: WithdrawalDto,
  ): Promise<Withdrawal> {
    const account = await this.accountsService.getById(accountId);

    if (!account) {
      throw new BadRequestException('Account does not exist');
    }

    if (Decimal.sub(account.balance, transactionData.amount).isNegative()) {
      throw new BadRequestException('Insufficient funds for withdrawal');
    }

    return this.prismaService.$transaction(async (ctx) => {
      const transaction = await ctx.transaction.create({
        data: {
          userId,
          ...transactionData,
        },
      });

      await ctx.account.update({
        where: { id: accountId },
        data: { balance: { decrement: transactionData.amount } },
      });

      const withdrawal = await ctx.withdrawal.create({
        data: { accountId, transactionId: transaction.id },
      });

      return withdrawal;
    });
  }

  public async deleteWithdrawal(
    userId: string,
    withdrawalId: string,
  ): Promise<Withdrawal> {
    const withdrawal = await this.prismaService.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { transaction: true },
    });

    if (!withdrawal) {
      throw new BadRequestException('Withdrawal does not exist');
    }

    if (withdrawal.transaction.userId !== userId) {
      throw new ForbiddenException('Withdrawal does not belong to the user');
    }

    return this.prismaService.$transaction(async (ctx) => {
      const deletedWithdrawal = await ctx.withdrawal.delete({
        where: { id: withdrawalId },
      });

      await ctx.transaction.delete({
        where: { id: withdrawal.transactionId },
      });

      await ctx.account.update({
        where: { id: deletedWithdrawal.accountId },
        data: { balance: { increment: withdrawal.transaction.amount } },
      });

      return deletedWithdrawal;
    });
  }

  public async deleteDeposit(
    userId: string,
    depositId: string,
  ): Promise<Deposit> {
    const deposit = await this.prismaService.deposit.findUnique({
      where: { id: depositId },
      include: { transaction: true },
    });

    if (!deposit) {
      throw new BadRequestException('Deposit does not exist');
    }

    if (deposit.transaction.userId !== userId) {
      throw new ForbiddenException('Deposit does not belong to the user');
    }

    return this.prismaService.$transaction(async (ctx) => {
      const deletedDeposit = await ctx.deposit.delete({
        where: { id: depositId },
      });

      await ctx.transaction.delete({
        where: { id: deposit.transactionId },
      });

      await ctx.account.update({
        where: { id: deletedDeposit.accountId },
        data: { balance: { decrement: deposit.transaction.amount } },
      });

      return deletedDeposit;
    });
  }

  private async updateWithdrawalAmount(
    transactionId: string,
    originalAmount: Decimal,
    updatedTransactionDto: UpdateTransactionDto & { amount: number },
  ): Promise<Transaction> {
    const withdrawal = await this.prismaService.withdrawal.findUnique({
      where: { transactionId },
      include: { account: true },
    });

    if (!withdrawal) {
      throw new BadRequestException('Withdrawal does not exist');
    }

    const isSufficientFunds = Decimal.sub(
      withdrawal.account.balance,
      Decimal.sub(updatedTransactionDto.amount, originalAmount),
    ).isNegative();

    if (!isSufficientFunds) {
      throw new BadRequestException('Insufficient funds for withdrawal update');
    }

    return this.prismaService.$transaction(async (ctx) => {
      await ctx.account.update({
        where: { id: withdrawal.accountId },
        data: {
          balance: {
            decrement: Decimal.sub(
              updatedTransactionDto.amount,
              originalAmount,
            ),
          },
        },
      });

      return ctx.transaction.update({
        where: { id: transactionId },
        data: updatedTransactionDto,
      });
    });
  }

  private async updateDepositAmount(
    transactionId: string,
    originalAmount: Decimal,
    updatedTransactionDto: UpdateTransactionDto & { amount: number },
  ): Promise<Transaction> {
    const deposit = await this.prismaService.deposit.findUnique({
      where: { transactionId },
    });

    if (!deposit) {
      throw new BadRequestException('Deposit does not exist');
    }

    return this.prismaService.$transaction(async (ctx) => {
      await ctx.account.update({
        where: { id: deposit.accountId },
        data: {
          balance: {
            increment: Decimal.sub(
              updatedTransactionDto.amount,
              originalAmount,
            ),
          },
        },
      });

      return ctx.transaction.update({
        where: { id: transactionId },
        data: updatedTransactionDto,
      });
    });
  }

  public async updateTransaction(
    userId: string,
    transactionId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.prismaService.transaction.findUnique({
      where: { id: transactionId },
      include: { withdrawal: true, deposit: true },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction does not exist');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('Transaction does not belong to the user');
    }

    if (typeof updateTransactionDto.amount === 'number') {
      console.log(updateTransactionDto.amount);
      if (transaction.withdrawal) {
        return this.updateWithdrawalAmount(
          transactionId,
          transaction.amount,
          updateTransactionDto as UpdateTransactionDto & { amount: number },
        );
      }

      if (transaction.deposit) {
        return this.updateDepositAmount(
          transactionId,
          transaction.amount,
          updateTransactionDto as UpdateTransactionDto & { amount: number },
        );
      }

      throw new BadRequestException(
        'Transaction is neither a deposit nor a withdrawal',
      );
    }

    return this.prismaService.transaction.update({
      where: { id: transactionId },
      data: updateTransactionDto,
    });
  }
}
