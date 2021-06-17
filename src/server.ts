import { OkImpl, ErrImpl, Ok, Err } from './result'
import { Server as ServerBase } from 'http'
import { Request, Response } from './types'
import invariant from 'tiny-invariant'
import stacktrace from './stacktrace'
import { AddressInfo } from 'net'

export type Method = (req: Request, ...args: any[]) => any
export { Request }

/**
 * The type for server methods.
 */
export type Methods = {
  [method: string]: Method
}
export { Server }

async function getResult(action: <T = unknown, R = unknown>(args?: T) => R) {
  try {
    const result = await Promise.resolve(stacktrace.barrier(action))

    if (result instanceof OkImpl || result instanceof ErrImpl) {
      return result
    }

    return Ok(result)
  } catch (error) {
    const stack = stacktrace.get(error)
    console.error(`unhandled exception in method: ${error} ${stack}`)

    if (process.env.NODE_ENV === 'production') {
      return Err('internal server error', '')
    }

    return Err(error, stack)
  }
}

/**
 * createMiddleware responds to HTTP requests using methods provided.
 */
export const createMiddleware = function (methods: Methods) {
  async function handleRequest(req: Request, res: Response): Promise<void> {
    invariant(!Array.isArray(req.body), 'Do not support batched request') // TODO: support batch
    invariant(req.body.jsonrpc === '2.0', 'jsonrpc version is not 2.0')
    invariant(
      req.method?.toUpperCase() === 'POST',
      `Only HTTP POST is supported: '${req.method}'`
    )
    invariant(
      !req.body.method?.startsWith('_'),
      `Cannot call methods prefixed with '_': '${req.body.method}'`
    )
    invariant(
      methods[req.body.method]?.call,
      `Method does not exist: '${req.body.method}'`
    )
    invariant(
      Array.isArray(req.body.params),
      `Parameters must be an array: ${req.body.params}`
    )

    const method = methods[req.body.method]

    const result = await getResult(method.bind(null, req, ...req.body.params))

    res.end(
      JSON.stringify({
        jsonrpc: '2.0',
        id: req.body.id,
        result,
      })
    )
  }

  return async (req: Request, res: Response) => {
    try {
      invariant(
        typeof req.body === 'object',
        'req.body was not an object, is JSON parsing enabled?'
      )
      await handleRequest(req, res)
    } catch (e) {
      res.json({
        jsonrpc: '2.0',
        id: req.body.id,
        result: Err(e.message),
      })
    }
  }
}

/**
 * The createServer returns an Express server with RPC middleware on /`path`
 */
interface Server extends Omit<ServerBase, 'address'> {
  address: () => AddressInfo
}
export async function createServer(
  methods: Methods,
  port = 0,
  path = '/rpc'
): Promise<Server> {
  const { default: express } = await import('express')

  const app = express()

  app.use(express.json())
  app.use(path, createMiddleware(methods))

  return new Promise((resolve) => {
    const server = app.listen(port, () => resolve(server)) as Server
  })
}
