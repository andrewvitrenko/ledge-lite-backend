import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class UpdatePeriodDto {
  @ApiProperty({
    description: 'The new end date of the period',
    example: '2025-09-30T23:59:59.999Z',
  })
  @IsDateString()
  endDate: string;
}
