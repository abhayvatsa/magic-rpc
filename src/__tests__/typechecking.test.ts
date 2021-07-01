import { assert, IsExact } from 'conditional-type-checks';
import { wrapInClient } from './app';

describe('typechecking', () => {
  it.concurrent(
    'type narrowing works correctly',
    wrapInClient(async ({ math }) => {
      const result = await math.divide(10, 0);

      if (result.ok) {
        assert<IsExact<typeof result.val, number>>(true);
      } else {
        assert<IsExact<typeof result.val, 'Divided by zero'>>(true);
      }
    })
  );
});
