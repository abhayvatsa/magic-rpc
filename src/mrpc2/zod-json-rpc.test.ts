import fetch from 'isomorphic-unfetch';
import { withTestServer } from './server-test-utils';
import { createZodJsonRpcServer } from './server';
import { createZodJsonRpcClient } from './client';
import { Router } from 'express';
import { jsSnapshot, javaSnapshot } from './snapshot-utils';

test('it works', async () => {
  const { default: methods } = await import('./example-server');
  const router = Router();
  router.use('/rpc', createZodJsonRpcServer(methods));
  await withTestServer(router, async (port) => {
    const request = createZodJsonRpcClient<typeof methods>(
      `http://localhost:${port}/rpc`
    );
    const response = await request('hello', { name: 'pete' });
    expect(response).toEqual({ message: 'hello, pete!' });

    const schema = await (
      await fetch(`http://localhost:${port}/rpc/schema`)
    ).text();

    expect(schema).toMatchInlineSnapshot(jsSnapshot);

    const java = await (
      await fetch(`http://localhost:${port}/rpc/schema?lang=java`)
    ).text();

    expect(java).toMatchInlineSnapshot(javaSnapshot);
  });
});
