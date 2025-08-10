import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prismaService: PrismaService) {}

  public getById(id: string): Promise<Account | null> {
    return this.prismaService.account.findUnique({ where: { id } });
  }

  public getByName(userId: string, name: string): Promise<Account | null> {
    return this.prismaService.account.findUnique({
      where: { userId_name: { userId, name } },
    });
  }

  public getAll(userId: string): Promise<Account[]> {
    return this.prismaService.account.findMany({ where: { userId } });
  }

  public create(
    userId: string,
    createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return this.prismaService.account.create({
      data: { userId, ...createAccountDto },
    });
  }

  public update(
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    return this.prismaService.account.update({
      where: { id },
      data: updateAccountDto,
    });
  }

  public delete(id: string): Promise<Account> {
    return this.prismaService.account.delete({ where: { id } });
  }
}
