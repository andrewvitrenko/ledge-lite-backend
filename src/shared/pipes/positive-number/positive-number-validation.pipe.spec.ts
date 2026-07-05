import { type ArgumentMetadata, BadRequestException } from '@nestjs/common';

import { PositiveNumberValidationPipe } from './positive-number-validation.pipe';

describe('PositiveNumberValidationPipe', () => {
  const metadata: ArgumentMetadata = {
    type: 'param',
    metatype: Number,
    data: 'id',
  };

  describe('default configuration', () => {
    let pipe: PositiveNumberValidationPipe;

    beforeEach(() => {
      pipe = new PositiveNumberValidationPipe();
    });

    it('should not allow zero by default', () => {
      expect(() => pipe.transform('0', metadata)).toThrow(BadRequestException);
    });

    it('should not allow decimals by default', () => {
      expect(() => pipe.transform('5.5', metadata)).toThrow(
        BadRequestException,
      );
    });

    it('should return valid positive numbers', () => {
      expect(pipe.transform('10', metadata)).toBe(10);
    });
  });

  describe('allowZero configuration', () => {
    let pipe: PositiveNumberValidationPipe;

    beforeEach(() => {
      pipe = new PositiveNumberValidationPipe({ allowZero: true });
    });

    it('should allow zero when allowZero is true', () => {
      expect(pipe.transform('0', metadata)).toBe(0);
      expect(pipe.transform(0, metadata)).toBe(0);
    });

    it('should still reject negative numbers', () => {
      expect(() => pipe.transform('-1', metadata)).toThrow(BadRequestException);
    });

    it('should allow positive numbers', () => {
      expect(pipe.transform('5', metadata)).toBe(5);
    });
  });

  describe('allowDecimals configuration', () => {
    let pipe: PositiveNumberValidationPipe;

    beforeEach(() => {
      pipe = new PositiveNumberValidationPipe({
        allowDecimals: false,
      });
    });

    it('should reject decimal numbers when allowDecimals is false', () => {
      expect(() => pipe.transform('5.5', metadata)).toThrow(
        BadRequestException,
      );
      expect(() => pipe.transform('10.1', metadata)).toThrow(
        BadRequestException,
      );
    });

    it('should allow whole numbers when allowDecimals is false', () => {
      expect(pipe.transform('5', metadata)).toBe(5);
      expect(pipe.transform('10', metadata)).toBe(10);
    });

    it('should include appropriate error message for decimals', () => {
      try {
        pipe.transform('5.5', metadata);
      } catch (error) {
        expect((error as Error).message).toContain('must be a whole number');
      }
    });
  });

  describe('custom error message', () => {
    let pipe: PositiveNumberValidationPipe;
    const customMessage = 'Custom validation error';

    beforeEach(() => {
      pipe = new PositiveNumberValidationPipe({
        errorMessage: customMessage,
      });
    });

    it('should use custom error message for all validation failures', () => {
      const testCases = ['abc', '-5', '0', 'Infinity'];

      testCases.forEach((testCase) => {
        expect(() => pipe.transform(testCase, metadata)).toThrow(customMessage);
      });
    });

    it('should use custom error message with allowDecimals false', () => {
      const pipeWithOptions = new PositiveNumberValidationPipe({
        allowDecimals: false,
        errorMessage: customMessage,
      });

      expect(() => pipeWithOptions.transform('5.5', metadata)).toThrow(
        customMessage,
      );
    });

    it('should use custom error message with allowZero true', () => {
      const pipeWithOptions = new PositiveNumberValidationPipe({
        allowZero: true,
        errorMessage: customMessage,
      });

      expect(() => pipeWithOptions.transform('-1', metadata)).toThrow(
        customMessage,
      );
    });
  });

  describe('combined configurations', () => {
    let pipe: PositiveNumberValidationPipe;

    beforeEach(() => {
      pipe = new PositiveNumberValidationPipe({
        allowZero: true,
        allowDecimals: false,
      });
    });

    it('should allow zero and whole numbers only', () => {
      expect(pipe.transform('0', metadata)).toBe(0);
      expect(pipe.transform('5', metadata)).toBe(5);
      expect(pipe.transform('100', metadata)).toBe(100);
    });

    it('should reject decimals with default message', () => {
      try {
        pipe.transform('5.5', metadata);
      } catch (error) {
        expect((error as Error).message).toContain('must be a whole number');
      }
    });

    it('should reject negative numbers with default message', () => {
      try {
        pipe.transform('-1', metadata);
      } catch (error) {
        expect((error as Error).message).toContain(
          'must be a non-negative number',
        );
      }
    });
  });

  describe('combined configurations with custom error message', () => {
    let pipe: PositiveNumberValidationPipe;
    const customMessage = 'Value must be a non-negative whole number';

    beforeEach(() => {
      pipe = new PositiveNumberValidationPipe({
        allowZero: true,
        allowDecimals: false,
        errorMessage: customMessage,
      });
    });

    it('should use custom message for all validation failures', () => {
      const invalidCases = ['5.5', '-1', 'abc', 'Infinity'];

      invalidCases.forEach((testCase) => {
        expect(() => pipe.transform(testCase, metadata)).toThrow(customMessage);
      });
    });
  });
});
