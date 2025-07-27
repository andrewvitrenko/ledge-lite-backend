import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

import { PASSWORD_REGEX } from '@/shared/config/validation';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must consist of at least 8 symbols, uppercase and lowercase letters and numbers',
  })
  password: string;
}
