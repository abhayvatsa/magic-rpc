import { promises } from 'fs';
import { Ok, Err, Result } from 'magic-rpc';

export const services = {
  math: {
    divide(_req: any, x: number, y: number): Result<number, 'Divided by zero'> {
      if (y === 0) {
        return Err('Divided by zero');
      } else {
        return Ok(x / y);
      }
    },
  },
  fs: {
    async readFile(
      _: any,
      path: string
    ): Promise<Result<string, `could not open file` | 'no such file'>> {
      try {
        return Ok(await promises.readFile(path, 'utf8'));
      } catch (err) {
        if (err.code === 'ENOENT') {
          return Err('no such file');
        }
        return Err('could not open file');
      }
    },
  },
};

export type Services = typeof services;
