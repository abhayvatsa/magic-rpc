import { NextApiRequest as Request } from 'next';
import { Ok, Err, Result } from 'magic-rpc';

const people = [
  { name: 'Abhay', age: 32 },
  { name: 'Koz', age: 30 },
  { name: 'Dijkstra', age: 72 },
];

/*
 * Each method tests a different kind of case that can happen for methods
 */
export default {
  // Ret: synchronous return value + non-result
  hello(_: Request, name: string) {
    return `Hello ${name}!!`;
  },
  // Ret: asynchronous return value + non-result
  async goodbye(_req: Request, name: string) {
    return `Goodbye ${name}!`;
  },
  // Ret: asynchronous return value + Ok (Result)
  async getUnixTime(_req: Request) {
    return Ok(new Date().getTime());
  },
  // Ret: asynchronous return value + Ok/Err (Result)
  async getPeople(_req: Request) {
    return Math.random() > 0.5 ? Ok(people) : Err('ahh!');
  },
  // Ret: asynchronous return value + Result<T,E> return type
  divide(
    _req: Request,
    x: number,
    y: number
  ): Result<number, 'Divided by zero'> {
    if (y === 0) {
      return Err('Divided by zero');
    } else {
      return Ok(x / y);
    }
  },
};
