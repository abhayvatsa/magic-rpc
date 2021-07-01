import fetch from 'cross-fetch';
import { createClient, createServer } from '../';
import { names, services, Services } from './services';

type Await<T> = T extends Promise<infer U> ? U : T;
type Client = Await<ReturnType<typeof createRpc>>['client'];

export const createRpc = async function () {
  const server = await createServer(services);
  const rpcUrl = `http://localhost:${server.address().port}/rpc`;

  return {
    rpcUrl,

    teardown: () => server.close(),

    client: createClient<Services>(names, rpcUrl, fetch),
  };
};

export function wrapInClient(fn: (client: Client) => any) {
  return async function () {
    const { client, teardown } = await createRpc();

    try {
      await fn(client);
    } finally {
      teardown();
    }
  };
}
