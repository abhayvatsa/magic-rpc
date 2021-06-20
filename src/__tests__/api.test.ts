import { createRpc } from './app';

describe('API', () => {
  it.concurrent('Test a synchronous method returning non-Result', async () => {
    const rpc = await createRpc();
    const result = await rpc.client.hello('world');

    expect(result.ok).toEqual(true);
    expect(result.val).toEqual('Hello world!!');

    rpc.teardown();
  });

  it.concurrent(
    'Test an asynchronous method returning non-Result',
    async () => {
      const rpc = await createRpc();
      const { val } = await rpc.client.goodbye('abhay');

      expect(val).toEqual('Goodbye abhay!');

      rpc.teardown();
    }
  );

  it.concurrent('Test an asynchronous method return OkImpl', async () => {
    const rpc = await createRpc();
    const { ok, val } = await rpc.client.getUnixTime();

    expect(ok && typeof val === 'number');

    rpc.teardown();
  });

  it.concurrent(
    'Test an asynchronous method returning OkImpl/ErrImpl',
    async () => {
      const rpc = await createRpc();
      const result = await rpc.client.getPeople();

      expect(
        (result.err && result.val === 'ahh!') ||
          (result.ok && result.val.length === 3)
      ).toEqual(true);

      rpc.teardown();
    }
  );

  it.concurrent('Test an asynchronous method returning Result', async () => {
    const rpc = await createRpc();
    const result = await rpc.client.divide(10, 0);

    expect(result.ok).toEqual(false);
    expect(result.val === 'Divided by zero').toBeTruthy();
    if (!result.ok) {
      expect(result.stack).toBeTruthy();
    }

    rpc.teardown();
  });
});
