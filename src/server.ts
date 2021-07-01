import { Ok, Err, OkImpl, ErrImpl } from './result';
import { Server as ServerBase } from 'http';
import { Request, Response } from './types';
import invariant from 'tiny-invariant';
import stacktrace from './stacktrace';
import { AddressInfo } from 'net';

export type Method = (req: Request, ...args: any[]) => any;
export type { Request };

/**
 * The type for server methods.
 */
export type Methods = {
  [method: string]: Method;
};
export type Services = {
  [service: string]: Methods;
};

export { Server };

async function getResult(action: <T = unknown, R = unknown>(args?: T) => R) {
  try {
    const result = await Promise.resolve(stacktrace.barrier(action));

    if (result instanceof OkImpl || result instanceof ErrImpl) {
      return result;
    }

    return Ok(result);
  } catch (error) {
    const stack = stacktrace.get(error);
    console.error(`unhandled exception in method: ${error} ${stack}`);

    return Err('interval server error');
  }
}

/**
 * createRpcHandler responds to HTTP requests using methods provided.
 */
export const createRpcHandler = function (services: Services) {
  async function handleRequest(req: Request, res: Response): Promise<void> {
    invariant(
      typeof req.body === 'object',
      'req.body was not an object, is JSON parsing enabled?'
    );
    invariant(!Array.isArray(req.body), 'Do not support batched request'); // TODO: support batch
    invariant(req.body.jsonrpc === '2.0', 'jsonrpc version is not 2.0');
    invariant(
      req.method?.toUpperCase() === 'POST',
      `Only HTTP POST is supported: '${req.method}'`
    );
    invariant(
      !req.body.method?.startsWith('_'),
      `Cannot call methods prefixed with '_': '${req.body.method}'`
    );

    const service = services[req.body.service];
    invariant(service, `Service '${req.body.service}' does not exist`);

    invariant(
      service[req.body.method]?.call,
      `Method does not exist: '${req.body.method}'`
    );
    invariant(
      Array.isArray(req.body.params),
      `Parameters must be an array: ${req.body.params}`
    );

    const method = service[req.body.method];
    const args = [req, ...req.body.params];
    invariant(
      method.length === args.length,
      `Expected ${method.length - 1} arguments, received ${
        req.body.params.length
      }`
    );

    const result = await getResult(method.bind(null, ...args));

    if (process.env.NODE_ENV === 'production') {
      (result as any)._stack = '';
    }

    res.end(
      JSON.stringify({
        jsonrpc: '2.0',
        id: req.body.id,
        result,
      })
    );
  }

  return async (req: Request, res: Response) => {
    try {
      await handleRequest(req, res);
    } catch (e) {
      res.json({
        jsonrpc: '2.0',
        id: req.body.id,
        result: Err(e.message),
      });
    }
  };
};

export type RpcHandler = ReturnType<typeof createRpcHandler>;

/**
 * The createServer returns an Express server with RPC middleware on /`path`
 */
interface Server extends Omit<ServerBase, 'address'> {
  address: () => AddressInfo;
}
export async function createServer(
  methods: Services,
  port = 0,
  path = '/rpc'
): Promise<Server> {
  const { default: express } = await import('express');

  const app = express();

  app.use(express.json());
  app.use(path, createRpcHandler(methods));

  return new Promise((resolve) => {
    const server = app.listen(port, () => resolve(server)) as Server;
  });
}
