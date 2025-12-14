import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IEnvVariables } from '@/shared/model/env';
import { UsersService } from '@/users/users.service';

import type { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService<IEnvVariables>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET')!,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.getById(payload.sub);

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
