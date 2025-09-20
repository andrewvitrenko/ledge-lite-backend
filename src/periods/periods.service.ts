import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EPeriodStatus } from '@prisma/client';

import { AccountsService } from '../accounts/accounts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { GetOverviewDto } from './dto/get-overview.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';

@Injectable()
export class PeriodsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly accountsService: AccountsService,
  ) {}

  public async createPeriod(userId: string, dto: CreatePeriodDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Check if there's already an active period
    const activePeriod = await this.getActivePeriod(userId);
    if (activePeriod) {
      throw new BadRequestException('User already has an active period');
    }

    // Get all user accounts
    const accounts = await this.accountsService.getAll(userId);

    // Start a transaction to create period and snapshots
    return this.prismaService.$transaction(async (tx) => {
      // Create the period
      const period = await tx.period.create({
        data: {
          userId,
          name: dto.name,
          startDate,
          endDate,
          status: EPeriodStatus.ACTIVE,
        },
      });

      // Create snapshots for all accounts
      await Promise.all(
        accounts.map((account) =>
          tx.accountPeriodSnapshot.create({
            data: {
              periodId: period.id,
              accountId: account.id,
              startingBalance: account.balance,
              endingBalance: account.balance, // Initially same as starting balance
            },
          }),
        ),
      );

      return period;
    });
  }

  public async getActivePeriod(userId: string) {
    return this.prismaService.period.findFirst({
      where: {
        userId,
        status: EPeriodStatus.ACTIVE,
      },
    });
  }

  public async getAllPeriods(userId: string) {
    return this.prismaService.period.findMany({
      where: {
        userId,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  public async endPeriod(userId: string, periodId: string) {
    const period = await this.prismaService.period.findFirst({
      where: {
        id: periodId,
        userId,
        status: EPeriodStatus.ACTIVE,
      },
    });

    if (!period) {
      throw new NotFoundException('Active period not found');
    }

    // Get all accounts and their current balances
    const accounts = await this.accountsService.getAll(userId);

    // Update period and snapshots in a transaction
    return this.prismaService.$transaction(async (tx) => {
      // Update period status
      const updatedPeriod = await tx.period.update({
        where: { id: periodId },
        data: { status: EPeriodStatus.CLOSED },
      });

      // Update ending balances for all account snapshots
      await Promise.all(
        accounts.map((account) =>
          tx.accountPeriodSnapshot.update({
            where: {
              periodId_accountId: {
                periodId,
                accountId: account.id,
              },
            },
            data: {
              endingBalance: account.balance,
            },
          }),
        ),
      );

      return updatedPeriod;
    });
  }

  public async updatePeriodEndDate(
    userId: string,
    periodId: string,
    dto: UpdatePeriodDto,
  ) {
    const period = await this.prismaService.period.findFirst({
      where: {
        id: periodId,
        userId,
        status: EPeriodStatus.ACTIVE,
      },
    });

    if (!period) {
      throw new NotFoundException('Active period not found');
    }

    const newEndDate = new Date(dto.endDate);
    if (period.startDate >= newEndDate) {
      throw new BadRequestException('End date must be after start date');
    }

    return this.prismaService.period.update({
      where: { id: periodId },
      data: { endDate: newEndDate },
    });
  }

  /**
   * Get financial overview for a specific period
   * @param userId - The ID of the user
   * @param periodId - The ID of the period
   * @returns Overview statistics including total income, expenses, net worth and its change
   */
  public async getOverview(
    userId: string,
    periodId: string,
  ): Promise<GetOverviewDto> {
    // Get period details with account snapshots in a single query
    const period = await this.prismaService.period.findFirst({
      where: {
        id: periodId,
        userId,
      },
      include: {
        accountSnapshots: true,
        transactions: {
          include: {
            deposit: true,
            withdrawal: true,
          },
        },
      },
    });

    if (!period) {
      throw new Error('Period not found');
    }

    // Calculate total income from deposits using Prisma.Decimal
    const totalIncome = period.transactions
      .filter((t) => t.deposit)
      .reduce((sum, t) => sum.add(t.amount), new Prisma.Decimal(0));

    // Calculate total expenses from withdrawals using Prisma.Decimal
    const totalExpenses = period.transactions
      .filter((t) => t.withdrawal)
      .reduce((sum, t) => sum.add(t.amount), new Prisma.Decimal(0));

    // Calculate net worth from account snapshots ending balances using Prisma.Decimal
    const netWorth = period.accountSnapshots.reduce(
      (sum, snapshot) => sum.add(snapshot.endingBalance),
      new Prisma.Decimal(0),
    );

    // Calculate net worth change using start and end balances with Prisma.Decimal
    const netWorthChange = period.accountSnapshots.reduce(
      (sum, snapshot) =>
        sum.add(snapshot.endingBalance.sub(snapshot.startingBalance)),
      new Prisma.Decimal(0),
    );

    return {
      totalIncome: totalIncome.toNumber(),
      totalExpenses: totalExpenses.toNumber(),
      netWorth: netWorth.toNumber(),
      netWorthChange: netWorthChange.toNumber(),
    };
  }
}
