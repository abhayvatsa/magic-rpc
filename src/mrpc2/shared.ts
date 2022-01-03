import { Request, Response } from 'express';
import { ZodRawShape, z, ZodObject } from 'zod';

export type MaybeAsync<T> = T | Promise<T>;
export type TypedFunctionImpl<
  TArg extends ZodRawShape,
  TRet extends ZodRawShape
> = (
  arg: z.infer<ZodObject<TArg>>,
  req: Request,
  res: Response
) => MaybeAsync<z.infer<ZodObject<TRet>>>;

export interface TypedFunction<
  TArg extends ZodRawShape,
  TRet extends ZodRawShape
> {
  arg: TArg;
  ret: TRet;
  func: TypedFunctionImpl<TArg, TRet>;
}

export type Methods = Record<string, TypedFunction<any, any>>;
