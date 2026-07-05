# Positive Number Validation Pipe

This module provides a custom NestJS pipe for validating positive numbers with configurable options.

## Overview

The `PositiveNumberValidationPipe` is a flexible pipe that validates incoming values as positive numbers with various configuration options to suit different use cases.

## Installation

The pipe is already included in your NestJS project. Simply import it:

```typescript
import {
  PositiveNumberValidationPipe,
  type PositiveNumberValidationOptions,
} from '@/shared/pipes/positive-number';
```

## Basic Usage

### Simple Positive Number Validation

By default, the pipe validates that a value is a positive number (greater than 0) and allows decimal numbers.

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { PositiveNumberValidationPipe } from '@/shared/pipes/positive-number';

@Controller('users')
export class UsersController {
  @Get(':id')
  async getUser(@Param('id', new PositiveNumberValidationPipe()) id: number) {
    return { userId: id };
  }
}
```

**Valid inputs:** `1`, `5.5`, `"10"`, `"3.14"`
**Invalid inputs:** `0`, `-1`, `"abc"`, `null`, `undefined`, `Infinity`

### Configurable Validation with Options

The pipe accepts an options object to customize its behavior:

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { PositiveNumberValidationPipe } from '@/shared/pipes/positive-number';

@Controller('products')
export class ProductsController {
  @Get(':id')
  async getProduct(
    @Param(
      'id',
      new PositiveNumberValidationPipe({
        allowZero: true,
        allowDecimals: false,
      }),
    )
    id: number,
  ) {
    return { productId: id };
  }
}
```

## Configuration Options

The `PositiveNumberValidationPipe` accepts an options object with the following properties:

### `allowZero: boolean` (default: `false`)

Controls whether zero is considered a valid value.

```typescript
// Does not allow zero (default)
new PositiveNumberValidationPipe();
// Valid: 1, 2, 3.5
// Invalid: 0, -1, -0.5

// Allows zero
new PositiveNumberValidationPipe({ allowZero: true });
// Valid: 0, 1, 2, 3.5
// Invalid: -1, -0.5
```

### `allowDecimals: boolean` (default: `true`)

Controls whether decimal numbers are allowed.

```typescript
// Allows decimals (default)
new PositiveNumberValidationPipe({ allowDecimals: true });
// Valid: 1, 2.5, 3.14

// Only whole numbers
new PositiveNumberValidationPipe({ allowDecimals: false });
// Valid: 1, 2, 3
// Invalid: 1.5, 2.7, 3.14
```

### `errorMessage: string` (optional)

Provides a custom error message for all validation failures.

```typescript
new PositiveNumberValidationPipe({
  errorMessage: 'Value must be a positive number',
});
// All validation errors will use this message instead of default ones

// Example with multiple options
new PositiveNumberValidationPipe({
  allowZero: true,
  allowDecimals: false,
  errorMessage: 'Value must be a non-negative whole number',
});
```

## Common Use Cases

### User/Entity IDs

```typescript
@Get('user/:id')
async getUser(
  @Param('id', new PositiveNumberValidationPipe()) id: number
) {
  // id is guaranteed to be a positive number
}
```

### Pagination Parameters

```typescript
@Get('items')
async getItems(
  @Query('page', new PositiveNumberValidationPipe({
    allowDecimals: false
  })) page: number,
  @Query('limit', new PositiveNumberValidationPipe({
    allowDecimals: false
  })) limit: number
) {
  // page and limit are guaranteed to be positive integers
}
```

### Financial Amounts (allowing zero for balance checks)

```typescript
@Post('deposit')
async deposit(
  @Body('amount', new PositiveNumberValidationPipe({
    allowZero: true,
    errorMessage: 'Amount must be a non-negative number'
  })) amount: number
) {
  // amount can be 0 or positive (useful for balance inquiries)
}
```

### Inventory Quantities (integers only)

```typescript
@Post('inventory')
async updateInventory(
  @Body('quantity', new PositiveNumberValidationPipe({
    allowZero: true,
    allowDecimals: false,
    errorMessage: 'Quantity must be a non-negative whole number'
  })) quantity: number
) {
  // quantity is a non-negative integer
}
```

## Error Handling

The pipe throws `BadRequestException` when validation fails. The error messages include:

- **Invalid number:** `"Validation failed: "abc" is not a valid number"`
- **Infinite values:** `"Validation failed: "Infinity" must be a finite number"`
- **Negative numbers (allowZero: false):** `"Validation failed: "-5" must be a positive number (greater than 0)"`
- **Negative numbers (allowZero: true):** `"Validation failed: "-5" must be a non-negative number (greater than or equal to 0)"`
- **Zero (when not allowed):** `"Validation failed: "0" must be a positive number (greater than 0)"`
- **Decimals (when not allowed):** `"Validation failed: "5.5" must be a whole number"`

## Type Safety

The pipe is fully typed and will convert valid string inputs to numbers:

```typescript
// Input: "123" (string)
// Output: 123 (number)
@Param('id', new PositiveNumberValidationPipe()) id: number
```

## Testing

The pipe includes comprehensive tests covering:

- Valid positive numbers (integers and decimals)
- Invalid inputs (negative, zero, non-numeric, infinite)
- Configuration options (allowZero, allowDecimals)
- Error message validation

Run tests with:

```bash
npm test positive-number-validation.pipe.spec.ts
```

## Integration with Swagger

The pipe works seamlessly with Swagger documentation:

```typescript
@ApiParam({ name: 'id', description: 'User ID (must be positive)', example: 123 })
@Get(':id')
async getUser(
  @Param('id', new PositiveNumberValidationPipe()) id: number
) {
  return { userId: id };
}
```

## Best Practices

1. **Use default settings** when you only need simple positive number validation
2. **Set allowZero: true** for scenarios where zero is meaningful (quantities, balance checks)
3. **Set allowDecimals: false** for IDs, pagination parameters, and counts
4. **Provide custom error messages** for better user experience and API clarity
5. **Combine with other validation** for complex scenarios (e.g., range validation)
6. **Use appropriate types** in your TypeScript interfaces and DTOs
7. **Add Swagger documentation** for better API documentation

## Implementation Details

The pipe follows NestJS best practices:

- Implements the `PipeTransform<any, number>` interface
- Uses the `@Injectable()` decorator for dependency injection
- Throws `BadRequestException` for validation failures
- Handles edge cases like `NaN`, `Infinity`, and type conversion
- Provides clear, descriptive error messages

## Examples

### Basic ID Validation

```typescript
// Validates positive integers for user IDs
@Get(':id')
async getUser(
  @Param('id', new PositiveNumberValidationPipe({ allowDecimals: false })) id: number
) {
  return this.usersService.findById(id);
}
```

### Financial Transaction Amounts

```typescript
// Allows zero for balance checks, decimals for currency amounts
@Post('transaction')
async createTransaction(
  @Body('amount', new PositiveNumberValidationPipe({
    allowZero: true,
    errorMessage: 'Transaction amount must be a non-negative number'
  })) amount: number
) {
  return this.transactionService.create(amount);
}
```

### Pagination with Integers Only

```typescript
// Ensures page and limit are positive integers with clear error messages
@Get('list')
async getList(
  @Query('page', new PositiveNumberValidationPipe({
    allowDecimals: false,
    errorMessage: 'Page must be a positive integer'
  })) page: number,
  @Query('limit', new PositiveNumberValidationPipe({
    allowDecimals: false,
    errorMessage: 'Limit must be a positive integer'
  })) limit: number
) {
  return this.service.findPaginated(page, limit);
}
```
