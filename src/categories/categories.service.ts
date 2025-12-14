import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { Category } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  IFilters,
  IPaginatedResponse,
  IPagination,
} from '@/shared/model/utils';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  public async getAll(
    userId: string,
    { page, take }: IPagination,
    { search }: IFilters,
  ): Promise<IPaginatedResponse<Category>> {
    const skip = (page - 1) * take;

    // Build where clause
    const whereClause = {
      userId,
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
    };

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count({
        where: whereClause,
      }),
    ]);

    return {
      data: categories,
      total,
    };
  }

  public async getById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  public async create(
    userId: string,
    dto: CreateCategoryDto,
  ): Promise<Category> {
    // Check if category with the same name already exists for this user
    const existingCategory = await this.prisma.category.findUnique({
      where: {
        name_userId: {
          name: dto.name,
          userId,
        },
      },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.category.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  public async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const existingCategory = await this.getById(id);

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    // If name is being updated, check for uniqueness
    if (dto.name && dto.name !== existingCategory.name) {
      const conflictingCategory = await this.prisma.category.findUnique({
        where: {
          name_userId: {
            name: dto.name,
            userId: existingCategory.userId,
          },
        },
      });

      if (conflictingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  public async delete(id: string): Promise<Category> {
    const existingCategory = await this.getById(id);

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
