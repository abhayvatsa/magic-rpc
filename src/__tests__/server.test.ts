import fetch from 'cross-fetch';
import { createRpc, wrapInClient } from './app';

describe('server error handling', () => {
  it.concurrent(
    'Test a method that does not exist',
    wrapInClient(async ({ math }) => {
      // @ts-expect-error: We are destructured a method that does not exist on client
      const { DOES_NOT_EXIST } = math;
      const { val, ok, stack } = await DOES_NOT_EXIST('world');

      expect(ok).toEqual(false);
      expect(stack).toBeTruthy();
      expect(val.includes('Method does not exist')).toBeTruthy();
    })
  );

  it.concurrent('Try a method other than HTTP POST', async () => {
    const rpc = await createRpc();

    try {
      const { result } = await fetch(rpc.rpcUrl, {
        method: 'DELETE',
        body: JSON.stringify({ jsonrpc: '2.0' }),
        headers: { 'Content-Type': 'application/json' },
      }).then((r) => r.json());

      expect(
        result.val.includes('Invariant failed: Only HTTP POST is supported')
      ).toBe(true);
    } finally {
      rpc.teardown();
    }
  });

  it.concurrent(
    'Try a method prefixed with _',
    wrapInClient(async ({ fs }) => {
      // This is usually a private method to the server
      const result = await fs._superSecretMethod();

      expect(result.err).toEqual(true);
    })
  );
});
