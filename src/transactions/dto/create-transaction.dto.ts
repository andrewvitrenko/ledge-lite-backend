import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { formatISO, isValid, parseISO } from 'date-fns';

import { EPaymentType } from '@/generated/prisma/enums';

export class CreateTransactionDto {
  @IsPositive()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;

  @Transform(({ value }) => {
    // 1. If the value is already a Date object
    if (value instanceof Date) {
      return formatISO(value);
    }

    // 2. If it's a string, attempt to parse it
    if (typeof value === 'string') {
      const parsed = parseISO(value);
      return isValid(parsed) ? formatISO(parsed) : value;
    }

    return value;
  })
  @IsISO8601({ strict: true, strictSeparator: true })
  date: string;

  @IsEnum(EPaymentType)
  paymentType: EPaymentType;
}
