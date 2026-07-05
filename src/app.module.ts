import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AccountsModule } from './accounts/accounts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CurrencyModule } from './currency/currency.module';
import { PrismaModule } from './prisma/prisma.module';
import { IEnvVariables } from './shared/model/env';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CurrencyModule,
    AccountsModule,
    CategoriesModule,
    ConfigModule.forRoot<IEnvVariables>({ isGlobal: true }),
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
