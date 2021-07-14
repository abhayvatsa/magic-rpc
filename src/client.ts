import { Ok, Err } from './result';
import invariant from 'tiny-invariant';
import { Request } from './server';
export type Fetch = typeof window.fetch;

// NOTE: Don't include `Request` for client-side parameters
declare type ExcludeRequest<T> = T extends [_: Request, ...args: infer A]
  ? A
  : T;

type ClientService<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer P
    ? (...args: ExcludeRequest<A>) => Promise<P>
    : never;
};

interface Module {
  default: any;
}

type ResolveDynamicImport<T> = T extends (...args: infer _) => Promise<infer P>
  ? P extends Module
    ? P['default']
    : T
  : T;

export type Client<T> = {
  [K in keyof T]: ClientService<ResolveDynamicImport<T[K]>>;
};

/**
 * The Client uses a typed proxy to make API calls to the server.
 */
export function createClient<T>(
  url: string,
  fetch = typeof window !== 'undefined' ? window?.fetch : null
) {
  invariant(fetch !== null, 'not passed a valid `fetch`');

  let idSeed = 1;

  return new Proxy(
    {},
    {
      get(_, service: string) {
        if (service === 'then') return null; // Proxy is not thennable (enable returning from async functions)

        return (function serviceProxy(service: keyof T) {
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
                        service,
                        method,
                        params,
                        id,
                      }),
                    });
                    const text = await response.text();
                    const json = JSON.parse(text);

                    invariant(json.id === id, 'invalid response id');

                    const { result, val } = json;

                    if (val) {
                      return val;
                    }

                    if (result.err) {
                      return Err(result.val, result._stack);
                    }

                    return Ok(result.val);
                  } catch (err) {
                    return Err(Error('Unexpected request error!'));
                  }
                };
              },
            }
          ) as ClientService<T[typeof service]>;
        })(service as keyof T);
      },
    }
  ) as Client<T>;
}
