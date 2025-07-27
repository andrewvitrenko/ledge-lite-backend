import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { omit } from '@/shared/lib/omit';
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

  public async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = await this.usersService.getUnsafeByEmail(email);

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return omit(user, ['password']);
  }

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
