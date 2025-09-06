import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreatePeriodDto {
  @ApiProperty({
    description: 'The name of the period',
    example: 'Q3 2025',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The start date of the period',
    example: '2025-07-01T00:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'The end date of the period',
    example: '2025-09-30T23:59:59.999Z',
  })
  @IsDateString()
  endDate: string;
}
