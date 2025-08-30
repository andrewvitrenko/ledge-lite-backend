import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { SafeUser } from '@/shared/model/user';

import { AccountsService } from '../accounts.service';

@Injectable()
class AccountConflictGuard implements CanActivate {
  constructor(private readonly accountsService: AccountsService) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx
      .switchToHttp()
      .getRequest<Request<void, void, { name?: string }>>();
    const user = request.user as SafeUser;
    const name = request.body?.name;

    if (!name) return true;

    const account = await this.accountsService.getByName(user.id, name);

    if (account)
      throw new BadRequestException('Account with this name already exists');

    return true;
  }
}

export const UseAccountConflictGuard = () => UseGuards(AccountConflictGuard);
