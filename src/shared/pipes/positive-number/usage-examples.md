# Usage Examples for Positive Number Validation Pipe

This document provides practical examples of how to use the `PositiveNumberValidationPipe` in your NestJS controllers.

## Basic Usage

### Simple Positive Number Validation

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { PositiveNumberValidationPipe } from '@/shared/pipes/positive-number';

@Controller('users')
export class UsersController {
  @Get(':id')
  async getUser(@Param('id', new PositiveNumberValidationPipe()) id: number) {
    // id is guaranteed to be a positive number
    return this.usersService.findById(id);
  }
}
```

### Configurable Validation with Options

```typescript
import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { PositiveNumberValidationPipe } from '@/shared/pipes/positive-number';

@Controller('products')
export class ProductsController {
  // Allow zero for product IDs (useful for "all products" queries)
  @Get(':id')
  async getProduct(
    @Param(
      'id',
      new PositiveNumberValidationPipe({
        allowZero: true,
        errorMessage: 'Product ID must be a non-negative number',
      }),
    )
    id: number,
  ) {
    return this.productsService.findById(id);
  }

  // Pagination with integer-only validation and custom error messages
  @Get()
  async getProducts(
    @Query(
      'page',
      new PositiveNumberValidationPipe({
        allowDecimals: false,
        errorMessage: 'Page must be a positive integer',
      }),
    )
    page: number,
    @Query(
      'limit',
      new PositiveNumberValidationPipe({
        allowDecimals: false,
        errorMessage: 'Limit must be a positive integer',
      }),
    )
    limit: number,
  ) {
    return this.productsService.findPaginated(page, limit);
  }
}
```

## Financial/Accounting Use Cases

```typescript
import { Controller, Post, Body, Param } from '@nestjs/common';
import { PositiveNumberValidationPipe } from '@/shared/pipes/positive-number';

@Controller('accounts')
export class AccountsController {
  // Allow zero for deposit amounts (balance inquiry)
  @Post(':accountId/deposit')
  async deposit(
    @Param(
      'accountId',
      new PositiveNumberValidationPipe({
        allowDecimals: false,
        errorMessage: 'Account ID must be a positive integer',
      }),
    )
    accountId: number,
    @Body(
      'amount',
      new PositiveNumberValidationPipe({
        allowZero: true,
        errorMessage: 'Deposit amount must be a non-negative number',
      }),
    )
    amount: number,
  ) {
    if (amount === 0) {
      return this.accountsService.getBalance(accountId);
    }
    return this.accountsService.deposit(accountId, amount);
  }

  // Strict positive amounts for withdrawals
  @Post(':accountId/withdraw')
  async withdraw(
    @Param(
      'accountId',
      new PositiveNumberValidationPipe({
        allowDecimals: false,
        errorMessage: 'Account ID must be a positive integer',
      }),
    )
    accountId: number,
    @Body(
      'amount',
      new PositiveNumberValidationPipe({
        errorMessage: 'Withdrawal amount must be a positive number',
      }),
    )
    amount: number,
  ) {
    return this.accountsService.withdraw(accountId, amount);
  }
}
```

## Integration with Your Existing Controllers

### Categories Controller

```typescript
// In src/categories/categories.controller.ts
import { PositiveNumberValidationPipe } from '@/shared/pipes/positive-number';

@Get(':id')
async findOne(
  @Param('id', new PositiveNumberValidationPipe({
    allowDecimals: false,
    errorMessage: 'Category ID must be a positive integer'
  })) id: number
) {
  return this.categoriesService.findOne(id);
}
```

### Periods Controller

```typescript
// In src/periods/periods.controller.ts
import { PositiveNumberValidationPipe } from '@/shared/pipes/positive-number';

@Get(':year/:month')
async getPeriod(
  @Param('year', new PositiveNumberValidationPipe({
    allowDecimals: false,
    errorMessage: 'Year must be a positive integer'
  })) year: number,
  @Param('month', new PositiveNumberValidationPipe({
    allowDecimals: false,
    errorMessage: 'Month must be a positive integer between 1 and 12'
  })) month: number
) {
  // Additional validation for month range could be done here
  if (month > 12) {
    throw new BadRequestException('Month must be between 1 and 12');
  }

  return this.periodsService.findByYearMonth(year, month);
}
```

### Accounts Controller

```typescript
// In src/accounts/accounts.controller.ts
import { PositiveNumberValidationPipe } from '@/shared/pipes/positive-number';

@Get(':id')
async findOne(
  @Param('id', new PositiveNumberValidationPipe({
    allowDecimals: false,
    errorMessage: 'Account ID must be a positive integer'
  })) id: number
) {
  return this.accountsService.findOne(id);
}

@Post()
async create(
  @Body('balance', new PositiveNumberValidationPipe({
    allowZero: true,
    errorMessage: 'Initial balance must be a non-negative number'
  })) balance: number
) {
  return this.accountsService.create({ balance });
}
```

## Advanced Examples

### Custom Error Messages for Different Scenarios

```typescript
@Controller('transactions')
export class TransactionsController {
  // Different error messages for different fields
  @Post()
  async create(
    @Body(
      'fromAccountId',
      new PositiveNumberValidationPipe({
        allowDecimals: false,
        errorMessage: 'Source account ID must be a positive integer',
      }),
    )
    fromAccountId: number,

    @Body(
      'toAccountId',
      new PositiveNumberValidationPipe({
        allowDecimals: false,
        errorMessage: 'Destination account ID must be a positive integer',
      }),
    )
    toAccountId: number,

    @Body(
      'amount',
      new PositiveNumberValidationPipe({
        errorMessage: 'Transaction amount must be a positive number',
      }),
    )
    amount: number,
  ) {
    return this.transactionService.transfer(fromAccountId, toAccountId, amount);
  }
}
```

### Inventory Management

```typescript
@Controller('inventory')
export class InventoryController {
  @Post(':productId/stock')
  async updateStock(
    @Param(
      'productId',
      new PositiveNumberValidationPipe({
        allowDecimals: false,
        errorMessage: 'Product ID must be a positive integer',
      }),
    )
    productId: number,

    @Body(
      'quantity',
      new PositiveNumberValidationPipe({
        allowZero: true,
        allowDecimals: false,
        errorMessage: 'Quantity must be a non-negative whole number',
      }),
    )
    quantity: number,
  ) {
    return this.inventoryService.updateStock(productId, quantity);
  }
}
```

## Error Handling

The pipe will automatically throw `BadRequestException` with your custom messages or descriptive default messages:

```
// Default error messages:
// Input: "abc"
// Error: "Validation failed: 'abc' is not a valid number"

// Input: "-5"
// Error: "Validation failed: '-5' must be a positive number (greater than 0)"

// Input: "0" (when allowZero: false)
// Error: "Validation failed: '0' must be a positive number (greater than 0)"

// Input: "5.5" (when allowDecimals: false)
// Error: "Validation failed: '5.5' must be a whole number"

// Custom error message:
// Any validation failure with errorMessage: 'Custom error'
// Error: "Custom error"
```

## Best Practices

1. **Use descriptive error messages** that help API users understand what's expected
2. **Be consistent** with error message formatting across your API
3. **Set allowZero: true** for quantities, balances, and optional amounts
4. **Set allowDecimals: false** for IDs, counts, and pagination parameters
5. **Combine with Swagger documentation** for better API documentation
6. **Consider the user experience** when crafting error messages

## Integration with Swagger

```typescript
import { ApiParam, ApiBody, ApiOperation } from '@nestjs/swagger';

@ApiOperation({ summary: 'Get user by ID' })
@ApiParam({
  name: 'id',
  description: 'User ID (positive integer)',
  example: 123,
  type: 'integer'
})
@Get(':id')
async getUser(
  @Param('id', new PositiveNumberValidationPipe({
    allowDecimals: false,
    errorMessage: 'User ID must be a positive integer'
  })) id: number
) {
  return this.usersService.findById(id);
}
```

## Type Safety

The pipe ensures that your controller methods receive actual `number` types, not strings:

```typescript
// Input: "123" (string from URL parameter)
// Output: 123 (number after pipe transformation)
@Get(':id')
async getUser(@Param('id', new PositiveNumberValidationPipe()) id: number) {
  // id is guaranteed to be a positive number, not a string
  console.log(typeof id); // "number"
  console.log(id + 1); // 124 (numeric addition, not string concatenation)
}
```

## Testing Your Implementation

When writing tests for controllers that use this pipe, remember that the pipe will automatically convert valid strings to numbers:

```typescript
// In your controller tests
describe('UsersController', () => {
  it('should get user by ID', async () => {
    const response = await request(app)
      .get('/users/123') // String in URL
      .expect(200);

    // The controller receives 123 as a number, not "123" as a string
    expect(mockUsersService.findById).toHaveBeenCalledWith(123);
  });

  it('should reject invalid IDs', async () => {
    await request(app)
      .get('/users/abc')
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('not a valid number');
      });
  });
});
```
