import { Ok, Err, Request, Result } from '../../';

// Note: return types vary just to make testing easier
export default {
  add(_: Request, a: number, b: number) {
    const sum = a + b;

    if (sum - b != a || sum - a != b) {
      return Err('Number overflow');
    }

    return sum;
  },

  async subtract(_: Request, a: number, b: number) {
    return Ok(a - b);
  },

  async multiply(_: Request, a: number, b: number) {
    const product = a * b;

    if (product / b !== a || product / a !== b) {
      return Err('Number overflow');
    }

    return Ok(product);
  },

  async divide(
    _: Request,
    a: number,
    b: number
  ): Promise<Result<number, 'Divided by zero'>> {
    if (b === 0) {
      return Err('Divided by zero');
    }

    return Ok(a / b);
  },
};
