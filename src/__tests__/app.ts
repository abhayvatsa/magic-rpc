import { createClient, createServer, Server } from '../'
import { methods } from './methods'

// configuration parameters
const port = 9999
export const rpcUrl = `http://localhost:${port}/rpc`

export const server = (function () {
  let server: Server

  return {
    async setup() {
      server = await createServer(methods, port)
    },
    teardown() {
      server.close()
    },
  }
})()

export const client = createClient<typeof methods>(rpcUrl)
