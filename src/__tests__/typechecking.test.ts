import { assert, IsExact } from 'conditional-type-checks';
import { RpcError } from '../';
import { wrapInClient, Client } from './app';

describe('typechecking', () => {
  it.concurrent(
    'type narrowing works correctly',
    wrapInClient(async ({ divide }: Client) => {
      const result = await divide(10, 0);

      if (result.ok) {
        assert<IsExact<typeof result.val, number>>(true);
      } else {
        assert<IsExact<typeof result.val, 'Divided by zero' | RpcError>>(true);
      }
    })
  );
});
