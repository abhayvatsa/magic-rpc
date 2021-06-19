import { Ok, Err, Result, ResultOkType, ResultErrType } from './result'
import crossFetch from 'cross-fetch'
import invariant from 'tiny-invariant'
import { Request } from './server'

export type Fetch = typeof crossFetch

export class RpcError {
  message: string
  constructor(message: string) {
    this.message = message
  }
}

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
type UnwrapResultOk<T> = T extends Result<unknown, unknown>
  ? ResultOkType<T>
  : T

// NOTE: Don't include `Request` for client-side parameters
type ExcludeRequest<T> = T extends (_: Request, ...args: infer A) => infer R
  ? (...args: A) => R
  : T

export type Client<T> = {
  [K in keyof T]: ExcludeRequest<T[K]> extends (...args: infer A) => infer P
    ? (
        ...args: A
      ) => Promise<
        Result<
          UnwrapResultOk<UnwrapPromise<P>>,
          ResultErrType<UnwrapPromise<P>> | RpcError
        >
      >
    : never
}

/**
 * The Client uses a typed proxy to make API calls to the server.
 */
export function createClient<T>(url: string, fetch = crossFetch): Client<T> {
  let idSeed = 1

  return new Proxy(
    {},
    {
      get(_, method: string) {
        return async (...params: unknown[]) => {
          const id = (idSeed++).toString()

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
            })
            const text = await response.text()
            const json = JSON.parse(text)

            invariant(json.jsonrpc === '2.0', 'invalid jsonrpc version')
            invariant(json.id === id, 'invalid response id')

            const {
              result: { err, val, _stack },
            } = json

            if (err) {
              const e = Err(val)
              ;(e as any)._stack = _stack
              return e
            }

            return Ok(val)
          } catch (err) {
            return Err(new RpcError('Unexpected request error!'))
          }
        }
      },
    }
  ) as Client<T>
}
