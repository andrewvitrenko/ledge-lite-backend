import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { Request } from 'express';

import { SafeUser } from '@/shared/model/user';

import { AccountsService } from '../accounts.service';

@Injectable()
export class AccountOwnershipGuard implements CanActivate {
  constructor(private readonly accountsService: AccountsService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<Request<{ id: string }>>();
    const { id } = request.params;
    const user = request.user as SafeUser;

    if (!id || !isUUID(id))
      throw new BadRequestException('Id must be a valid UUID');

    const account = await this.accountsService.getById(id);

    if (!account) throw new NotFoundException('No account with this id found');

    if (account.userId !== user.id) throw new ForbiddenException();

    return true;
  }
}

export const UseAccountOwnershipGuard = () => UseGuards(AccountOwnershipGuard);
