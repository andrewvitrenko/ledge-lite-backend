import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, ctx, status) {
    if (info instanceof TokenExpiredError) {
      throw new ForbiddenException('Token is expired');
    }

    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('Invalid token');
    }

    return super.handleRequest(err, user, info, ctx, status);
  }
}

export const UseJwtGuard = () => UseGuards(JwtAuthGuard);
