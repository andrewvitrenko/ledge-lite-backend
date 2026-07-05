import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { Request } from 'express';

import { CategoriesService } from '@/categories/categories.service';

class CategoryOwnershipGuard implements CanActivate {
  constructor(private readonly categoriesService: CategoriesService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx
      .switchToHttp()
      .getRequest<Request<void, void, { categoryId: string }>>();
    const userId = request.user?.['id'];

    const categoryId = request.body.categoryId;

    if (!categoryId) return true;

    if (!isUUID(categoryId)) {
      throw new BadRequestException('Category ID is not valid UUID');
    }

    const category = await this.categoriesService.getById(categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.userId !== userId) {
      throw new BadRequestException('This category does not belong to you');
    }

    return true;
  }
}

export const UseCategoryOwnershipGuard = () =>
  UseGuards(CategoryOwnershipGuard);
