import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

import { SafeUser } from '../model/user';

export const UseUserData = createParamDecorator((data: keyof SafeUser, ctx) => {
  const request = ctx.switchToHttp().getRequest<Request>();

  return data ? request.user?.[data] : request.user;
});
