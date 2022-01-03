import express from 'express';
import getPort from 'get-port';
import { Server } from 'http';
import { createHttpTerminator } from 'http-terminator';

export async function withTestServer<T>(
  handler: express.RequestHandler,
  callback: (port: number) => Promise<T>
): Promise<T> {
  const port = await getPort();
  let server: Server = null as any;
  const app = express();
  app.use(handler);
  await new Promise((resolve) => {
    server = app.listen(port, resolve as any);
  });
  const terminator = createHttpTerminator({ server });
  try {
    return await callback(port);
  } finally {
    await terminator.terminate();
  }
}
