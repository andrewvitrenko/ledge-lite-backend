import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const UseUserData = createParamDecorator((data: string, ctx) => {
  const request = ctx.switchToHttp().getRequest<Request>();

  return data ? request.user?.[data] : request.user;
});
