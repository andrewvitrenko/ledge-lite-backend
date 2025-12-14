import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';

export interface PositiveNumberValidationOptions {
  /**
   * Whether to allow zero as a valid value
   * @default false
   */
  allowZero?: boolean;

  /**
   * Whether to allow decimal numbers
   * @default true
   */
  allowDecimals?: boolean;

  /**
   * Custom error message for all validation failures
   * @default undefined (uses default messages)
   */
  errorMessage?: string;
}

@Injectable()
export class PositiveNumberValidationPipe implements PipeTransform<
  any,
  number
> {
  constructor(private readonly options: PositiveNumberValidationOptions = {}) {}

  transform(value: any, _metadata: ArgumentMetadata): number {
    // Convert the value to a number
    const numericValue = Number(value);

    // Check if the conversion resulted in NaN
    if (isNaN(numericValue)) {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Validation failed: "${value}" is not a valid number`,
      );
    }

    // Check if the number is not finite (handles Infinity and -Infinity)
    if (!isFinite(numericValue)) {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Validation failed: "${value}" must be a finite number`,
      );
    }

    // Check for decimal numbers if not allowed
    if (!this.options.allowDecimals && !Number.isInteger(numericValue)) {
      throw new BadRequestException(
        this.options.errorMessage ||
          `Validation failed: "${value}" must be a whole number`,
      );
    }

    if (this.options.allowZero) {
      if (numericValue < 0) {
        throw new BadRequestException(
          this.options.errorMessage ||
            `Validation failed: "${value}" must be a non-negative number (greater than or equal to 0)`,
        );
      }
    } else {
      if (numericValue <= 0) {
        throw new BadRequestException(
          this.options.errorMessage ||
            `Validation failed: "${value}" must be a positive number (greater than 0)`,
        );
      }
    }

    return numericValue;
  }
}
