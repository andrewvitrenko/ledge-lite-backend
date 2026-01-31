import { Module } from '@nestjs/common';

import { AccountsModule } from '@/accounts/accounts.module';
import { CategoriesModule } from '@/categories/categories.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
  imports: [PrismaModule, AccountsModule, CategoriesModule],
})
export class TransactionsModule {}
