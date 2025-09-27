import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CategoryOverviewItemDto {
  @ApiProperty({
    description: 'The unique identifier of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'The name of the category',
    example: 'Groceries',
  })
  @IsString()
  categoryName: string;

  @ApiProperty({
    description: 'Total amount spent in this category',
    example: 1250.5,
  })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({
    description: 'Percentage of total spending this category represents',
    example: 25.5,
  })
  @IsNumber()
  percentageOfTotal: number;

  @ApiProperty({
    description: 'Color code for the category visualization',
    example: '#FF5733',
  })
  @IsString()
  color: string;
}

export class GetCategoryOverviewResponseDto {
  @ApiProperty({
    description: 'Array of category overview items',
    type: [CategoryOverviewItemDto],
  })
  data: CategoryOverviewItemDto[];

  @ApiProperty({
    description: 'Total number of categories',
    example: 10,
  })
  @IsNumber()
  total: number;
}
