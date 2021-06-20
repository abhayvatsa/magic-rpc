import { createRpc } from './app';

describe('client', () => {
  it.concurrent(
    'Test an asynchronous method returning a client - ensure client is thennable',
    async () => {
      const { client, teardown } = await createRpc();

      async function getClient() {
        return client;
      }

      try {
        await getClient();
      } finally {
        teardown();
      }
    }
  );
});
