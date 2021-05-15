import { Ok, Err, Result, ResultOkType, ResultErrType } from './result'
import crossFetch from 'cross-fetch'
import invariant from 'tiny-invariant'
import { Request } from './server'

export type Fetch = typeof crossFetch

export class RPCError {
  message: string
  constructor(message: string) {
    this.message = message
  }
}

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
type UnwrapResultOk<T> = T extends Result<unknown, unknown>
  ? ResultOkType<T>
  : T

export type Client<T> = {
  [K in keyof T]: T[K] extends (_: Request, ...args: infer A) => infer P
    ? (
        ...args: A
      ) => Promise<
        Result<
          UnwrapResultOk<UnwrapPromise<P>>,
          ResultErrType<UnwrapPromise<P>> | RPCError
        >
      >
    : never // NOTE: We _expect_ the first parameter to be a request.
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
              result: { err, val, stack },
            } = json

            if (err) {
              return Err(val, val + '\n' + stack)
            }

            return Ok(val)
          } catch (err) {
            return Err(new RPCError('Unexpected request error!'))
          }
        }
      },
    }
  ) as Client<T>
}
