import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CurrencyService } from './currency.service';

@Module({
  providers: [CurrencyService],
  imports: [HttpModule],
  exports: [CurrencyService],
})
export class CurrencyModule {}
