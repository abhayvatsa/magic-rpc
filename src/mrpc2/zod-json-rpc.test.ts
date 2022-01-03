import fetch from 'isomorphic-unfetch';
import { withTestServer } from './server-test-utils';
import { createZodJsonRpcServer } from './server';
import { createZodJsonRpcClient } from './client';
import { Router } from 'express';
import { jsonSchemaSnapshot, javaSchemaSnapshot } from './snapshot-utils';

test('it works', async () => {
  // Define an example server
  const { default: methods } = await import('./example-server');
  const router = Router();
  router.use('/rpc', createZodJsonRpcServer(methods));

  // Define a wrapper for a test server
  await withTestServer(router, async (port) => {
    const request = createZodJsonRpcClient<typeof methods>(
      `http://localhost:${port}/rpc`
    );

    // verify a response
    const response = await request('hello', { name: 'pete' });
    expect(response).toEqual({ message: 'hello, pete!' });

    // verify JSON schema
    const schema = await (
      await fetch(`http://localhost:${port}/rpc/schema`)
    ).text();
    expect(schema).toMatchInlineSnapshot(jsonSchemaSnapshot);

    // verify java schema
    const java = await (
      await fetch(`http://localhost:${port}/rpc/schema?lang=java`)
    ).text();
    expect(java).toMatchInlineSnapshot(javaSchemaSnapshot);
  });
});
