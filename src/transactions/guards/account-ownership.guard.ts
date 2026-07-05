import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { Request } from 'express';

import { AccountsService } from '@/accounts/accounts.service';

class AccountOwnershipGuard implements CanActivate {
  constructor(private readonly accountsService: AccountsService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx
      .switchToHttp()
      .getRequest<Request<void, void, { accountId: string }>>();

    const userId = request.user?.['id'];

    const accountId = request.body.accountId;

    if (!isUUID(accountId)) {
      throw new BadRequestException('Account ID is not valid UUID');
    }

    const account = await this.accountsService.getById(accountId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.userId !== userId) {
      throw new BadRequestException('This account does not belong to you');
    }

    return true;
  }
}

export const UseAccountOwnershipGuard = () => UseGuards(AccountOwnershipGuard);
