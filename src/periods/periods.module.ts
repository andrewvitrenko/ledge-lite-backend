import { Module } from '@nestjs/common';

import { AccountsModule } from '@/accounts/accounts.module';
import { PrismaService } from '@/prisma/prisma.service';

import { PeriodsController } from './periods.controller';
import { PeriodsService } from './periods.service';

@Module({
  controllers: [PeriodsController],
  providers: [PeriodsService],
  imports: [PrismaService, AccountsModule],
})
export class PeriodsModule {}
