import { EAccountType } from '@prisma/client';
import {
  IsEnum,
  IsHexColor,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsHexColor()
  @IsOptional()
  color?: string | null;

  @IsEnum(EAccountType)
  @IsOptional()
  type?: EAccountType;

  @IsISO4217CurrencyCode()
  @IsOptional()
  currency?: string;
}
