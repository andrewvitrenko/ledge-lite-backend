import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EPeriodStatus } from '@prisma/client';

import { AccountsService } from '../accounts/accounts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';

@Injectable()
export class PeriodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsService: AccountsService,
  ) {}

  async createPeriod(userId: string, dto: CreatePeriodDto) {
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
    return this.prisma.$transaction(async (tx) => {
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

  async getActivePeriod(userId: string) {
    return this.prisma.period.findFirst({
      where: {
        userId,
        status: EPeriodStatus.ACTIVE,
      },
    });
  }

  async endPeriod(userId: string, periodId: string) {
    const period = await this.prisma.period.findFirst({
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
    return this.prisma.$transaction(async (tx) => {
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

  async updatePeriodEndDate(
    userId: string,
    periodId: string,
    dto: UpdatePeriodDto,
  ) {
    const period = await this.prisma.period.findFirst({
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

    return this.prisma.period.update({
      where: { id: periodId },
      data: { endDate: newEndDate },
    });
  }
}
