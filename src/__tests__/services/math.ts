import { Ok, Err, Request } from '../../';

export default {
  // Ret: asynchronous return value + Result<T,E> return type
  divide(_req: Request, dividend: number, divisor: number) {
    if (divisor === 0) {
      return Err('Divided by zero' as const);
    }
    return Ok(dividend / divisor);
  },
};
