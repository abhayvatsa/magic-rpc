import { createRpc } from './app';
import fetch from 'cross-fetch';

describe('server error handling', () => {
  it.concurrent('Test a method that does not exist', async () => {
    const rpc = await createRpc();
    // @ts-expect-error: We are destructured a method that does not exist on client
    const { DOES_NOT_EXIST } = rpc.client;
    const { val, ok, stack } = await DOES_NOT_EXIST('world');

    expect(ok).toEqual(false);
    expect(stack).toBeTruthy();
    expect(val.includes('Method does not exist')).toBeTruthy();

    rpc.teardown();
  });

  it.concurrent('Try a method other than HTTP POST', async () => {
    const rpc = await createRpc();
    const { result } = await fetch(rpc.rpcUrl, {
      method: 'DELETE',
      body: JSON.stringify({ jsonrpc: '2.0' }),
      headers: { 'Content-Type': 'application/json' },
    }).then((r) => r.json());

    expect(
      result.val.includes('Invariant failed: Only HTTP POST is supported')
    ).toBe(true);

    rpc.teardown();
  });

  it.concurrent('Try a method prefixed with _', async () => {
    const rpc = await createRpc();
    // This is usually a private method to the server
    const result = await rpc.client._superSecretMethod();

    expect(result.err).toEqual(true);

    rpc.teardown();
  });
});
