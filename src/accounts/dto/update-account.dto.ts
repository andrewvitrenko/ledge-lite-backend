import {
  IsEnum,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { EAccountType } from '@/generated/prisma/client';

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
}
