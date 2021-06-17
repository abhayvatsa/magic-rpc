import { createClient, createServer, Server } from '../'
import { methods } from './methods'

export const createRpc = async function () {
  const server = await createServer(methods)
  const rpcUrl = `http://localhost:${server.address().port}/rpc`

  return {
    rpcUrl,

    teardown() {
      server.close()
    },

    client: createClient<typeof methods>(rpcUrl),
  }
}
