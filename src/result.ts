import { ErrImpl as ErrImplBase, OkImpl as OkImplBase } from 'ts-results'
import stacktrace from './stacktrace'

export type { ResultOkType, ResultErrType } from 'ts-results'

export class ErrImpl<E> extends ErrImplBase<E> {
  readonly ok = false
  stack: string
  constructor(val: E, stack: string) {
    super(val)
    this.stack = stack
  }
}

export declare type Err<E> = ErrImpl<E>
export function Err<E>(val: E, stack = stacktrace.get()): Err<E> {
  return new ErrImpl(val, stack)
}

export class OkImpl<T> extends OkImplBase<T> {
  readonly ok = true
  stack = ''
}

export declare type Ok<T> = OkImpl<T>
export function Ok<T>(val: T): Ok<T> {
  return new OkImpl(val)
}

export declare type Result<T, E> = Ok<T> | Err<E>
