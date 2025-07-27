import { Body, Controller, Post } from '@nestjs/common';
import { Request } from 'express';

import { UseUserData } from '@/shared/decorators/use-user-data';
import { SafeUser } from '@/shared/model/user';
import { CreateUserDto } from '@/users/dto/create-user.dto';

import { AuthService } from './auth.service';
import { UseLocalGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseLocalGuard()
  @Post('login')
  login(@UseUserData() user: SafeUser) {
    return this.authService.login(user);
  }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }
}
