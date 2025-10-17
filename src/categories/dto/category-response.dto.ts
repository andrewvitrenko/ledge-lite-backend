import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the category',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the category',
    example: 'Groceries',
  })
  name: string;

  @ApiProperty({
    description: 'The color of the category in hex format',
    example: '#FF5733',
    nullable: true,
  })
  color: string | null;

  @ApiProperty({
    description: 'The ID of the user who owns this category',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  userId: string;

  @ApiProperty({
    description: 'The date when the category was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the category was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
