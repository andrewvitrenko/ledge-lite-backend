import { Module } from '@nestjs/common';

import { AccountsModule } from '@/accounts/accounts.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { PeriodsController } from './periods.controller';
import { PeriodsService } from './periods.service';

@Module({
  controllers: [PeriodsController],
  providers: [PeriodsService],
  imports: [PrismaModule, AccountsModule],
  exports: [PeriodsService],
})
export class PeriodsModule {}
