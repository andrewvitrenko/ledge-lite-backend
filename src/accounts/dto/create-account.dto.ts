import { EAccountType } from '@prisma/client';
import {
  IsEnum,
  IsHexColor,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
