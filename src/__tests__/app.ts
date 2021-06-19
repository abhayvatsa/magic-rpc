import { createClient, createServer } from '../'
import { methods } from './methods'

type Await<T> = T extends Promise<infer U> ? U : T
export type Client = Await<ReturnType<typeof createRpc>>['client']

export const createRpc = async function () {
  const server = await createServer(methods)
  const rpcUrl = `http://localhost:${server.address().port}/rpc`

  return {
    rpcUrl,

    teardown: () => server.close(),

    client: createClient<typeof methods>(rpcUrl),
  }
}

export function wrapInClient(fn: (client: Client) => any) {
  return async function () {
    const { client, teardown } = await createRpc()

    try {
      await fn(client)
    } finally {
      teardown()
    }
  }
}
