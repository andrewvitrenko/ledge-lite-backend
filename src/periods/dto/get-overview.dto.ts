import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

/**
 * DTO representing the financial overview for a specific period
 */
export class GetOverviewDto {
  @ApiProperty({
    description: 'Total income from all deposit transactions during the period',
    type: Number,
    example: 5000.5,
  })
  @IsNumber()
  totalIncome: number;

  @ApiProperty({
    description:
      'Total expenses from all withdrawal transactions during the period',
    type: Number,
    example: 3000.75,
  })
  @IsNumber()
  totalExpenses: number;

  @ApiProperty({
    description:
      'Total net worth (sum of all account balances) at the end of the period',
    type: Number,
    example: 25000.0,
  })
  @IsNumber()
  netWorth: number;

  @ApiProperty({
    description:
      'Change in net worth during the period (end balance - start balance)',
    type: Number,
    example: 2000.0,
  })
  @IsNumber()
  netWorthChange: number;
}
