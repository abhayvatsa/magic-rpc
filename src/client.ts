import { Ok, Err, Result, ResultOkType, ResultErrType } from './result';
import invariant from 'tiny-invariant';
import { Request } from './server';

export type Fetch = typeof window.fetch;

export class RpcError {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type UnwrapResultOk<T> = T extends Result<unknown, unknown>
  ? ResultOkType<T>
  : T;

// NOTE: Don't include `Request` for client-side parameters
declare type ExcludeRequest<T> = T extends [_: Request, ...args: infer A]
  ? A
  : T;

export type Client<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer P
    ? (
        ...args: ExcludeRequest<A>
      ) => Promise<
        Result<
          UnwrapResultOk<UnwrapPromise<P>>,
          ResultErrType<UnwrapPromise<P>> | RpcError
        >
      >
    : never;
};

/**
 * The Client uses a typed proxy to make API calls to the server.
 */
export function createClient<T>(url: string, fetch = window?.fetch): Client<T> {
  invariant(typeof fetch !== 'undefined', 'not passed a valid `fetch`');

  let idSeed = 1;

  return new Proxy(
    {},
    {
      get(_, method: string) {
        if (method === 'then') return null; // Proxy is not thennable (enable returning from async functions)

        return async (...params: unknown[]) => {
          const id = (idSeed++).toString();

          try {
            const response = await fetch(url, {
              method: 'post',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method,
                params,
                id,
              }),
            });
            const text = await response.text();
            const json = JSON.parse(text);

            invariant(json.jsonrpc === '2.0', 'invalid jsonrpc version');
            invariant(json.id === id, 'invalid response id');

            const {
              result: { err, val, _stack },
            } = json;

            if (err) {
              const e = Err(val);
              (e as any)._stack = _stack;
              return e;
            }

            return Ok(val);
          } catch (err) {
            return Err(new RpcError('Unexpected request error!'));
          }
        };
      },
    }
  ) as Client<T>;
}
