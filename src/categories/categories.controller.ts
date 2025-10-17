import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UseJwtGuard } from '@/auth/guards/jwt-auth.guard';
import { UseUserData } from '@/shared/decorators/use-user-data';
import { PositiveNumberValidationPipe } from '@/shared/pipes/positive-number';

import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetCategoriesResponseDto } from './dto/get-categories-response.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UseCategoryOwnershipGuard } from './guards/category-ownership.guard';

@ApiTags('categories')
@Controller('categories')
@UseJwtGuard()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('/')
  @ApiOperation({
    summary: 'Get all categories with pagination, filtering and sorting',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Number of items per page (default: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Filter categories by name (case insensitive)',
    example: 'Groceries',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of categories',
    type: GetCategoriesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async getAll(
    @UseUserData('id') userId: string,
    @Query(
      'page',
      new DefaultValuePipe(1),
      ParseIntPipe,
      new PositiveNumberValidationPipe({
        errorMessage: 'Page must be a positive number',
      }),
    )
    page: number,
    @Query(
      'take',
      new DefaultValuePipe(10),
      ParseIntPipe,
      new PositiveNumberValidationPipe({
        errorMessage: 'Take must be a positive number',
      }),
    )
    take: number,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return this.categoriesService.getAll(
      userId,
      {
        page,
        take,
      },
      { search },
    );
  }

  @Get('/:id')
  @UseCategoryOwnershipGuard()
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns category details',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not category owner' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  public async getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.getById(id);
  }

  @Post('/')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category has been successfully created',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists',
  })
  public async create(
    @UseUserData('id') userId: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(userId, createCategoryDto);
  }

  @Patch('/:id')
  @UseCategoryOwnershipGuard()
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category has been successfully updated',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not category owner' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists',
  })
  public async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete('/:id')
  @UseCategoryOwnershipGuard()
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category has been successfully deleted',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not category owner' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  public async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.delete(id);
  }
}
