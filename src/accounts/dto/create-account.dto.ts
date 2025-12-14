import {
  IsEnum,
  IsHexColor,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { EAccountType } from '@/generated/prisma/client';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsISO4217CurrencyCode()
  currency: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsEnum(EAccountType)
  type: EAccountType;
}
