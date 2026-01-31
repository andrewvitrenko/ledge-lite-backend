import {
  BadRequestException,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import type { Request } from 'express';

import type { SafeUser } from '@/shared/model/user';

import { CategoriesService } from '../categories.service';

@Injectable()
export class CategoryOwnershipGuard implements CanActivate {
  constructor(private readonly categoriesService: CategoriesService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<Request<{ id: string }>>();
    const { id } = request.params;
    const user = request.user as SafeUser;

    if (!id || !isUUID(id))
      throw new BadRequestException('Id must be a valid UUID');

    const category = await this.categoriesService.getById(id);

    if (!category)
      throw new NotFoundException('No category with this id found');

    if (category.userId !== user.id) {
      throw new ForbiddenException('Category does not belong to the user');
    }

    return true;
  }
}

export const UseCategoryOwnershipGuard = () =>
  UseGuards(CategoryOwnershipGuard);
