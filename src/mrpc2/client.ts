import { JSONRPCClient } from 'json-rpc-2.0';
import { z, ZodObject } from 'zod';
import { Methods } from './shared';
import unfetch from 'isomorphic-unfetch';

export function createZodJsonRpcClient<TMethods extends Methods>(
  url: string,
  fetchFn: typeof fetch = unfetch
) {
  const client: JSONRPCClient = new JSONRPCClient((jsonRPCRequest) =>
    fetchFn(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(jsonRPCRequest),
    }).then((response) => {
      if (response.status === 200) {
        return response
          .json()
          .then((jsonRPCResponse: any) => client.receive(jsonRPCResponse));
      } else if (jsonRPCRequest.id !== undefined) {
        return Promise.reject(new Error(response.statusText));
      }
    })
  );

  function request<TMethod extends keyof TMethods & string>(
    method: TMethod,
    arg: z.infer<ZodObject<TMethods[TMethod]['arg']>>
  ): Promise<z.infer<ZodObject<TMethods[TMethod]['ret']>>> {
    return client.request(method, arg) as any;
  }

  return request;
}
