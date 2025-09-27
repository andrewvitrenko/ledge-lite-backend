import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  providers: [AccountsService],
  controllers: [AccountsController],
  imports: [PrismaModule],
  exports: [AccountsService],
})
export class AccountsModule {}
