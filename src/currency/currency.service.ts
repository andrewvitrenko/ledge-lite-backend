import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { format } from 'date-fns';

import { GetExchangeRateResponse } from './interfaces/get-exchange-rate.interface';

@Injectable()
export class CurrencyService {
  constructor(private readonly httpService: HttpService) {}

  public async getExchangeRate(
    date: Date,
    base: string,
    final: string,
  ): Promise<number> {
    try {
      const { data } =
        await this.httpService.axiosRef.get<GetExchangeRateResponse>(
          `https://api.exchangeratesapi.io/v1/${format(date, 'yyyy-MM-dd')}`,
          {
            params: { base, symbols: [final] },
          },
        );

      return data.rates[final];
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
