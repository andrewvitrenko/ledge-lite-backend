import { ApiProperty } from '@nestjs/swagger';

import { CategoryResponseDto } from './category-response.dto';

export class GetCategoriesResponseDto {
  @ApiProperty({
    description: 'Array of categories',
    type: [CategoryResponseDto],
  })
  data: CategoryResponseDto[];

  @ApiProperty({
    description: 'Total number of categories',
    example: 25,
  })
  total: number;
}
