import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { SafeUser } from '@/shared/model/user';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UsersService } from '@/users/users.service';

import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private generateTokens({ email, id }: SafeUser) {
    const payload: JwtPayload = { email, sub: id };

    return { access_token: this.jwtService.sign(payload) };
  }

  public login(user: SafeUser) {
    return this.generateTokens(user);
  }

  async signup(createUserDto: CreateUserDto) {
    const userExists = await this.usersService
      .getUnsafeByEmail(createUserDto.email)
      .catch(() => null);

    if (userExists) {
      throw new BadRequestException('User with such email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.generateTokens(user);
  }
}
