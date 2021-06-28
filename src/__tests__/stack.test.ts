import { wrapInClient } from './app';

describe('stack', () => {
  it.concurrent(
    'Ensure stack trace exists in non-production',
    wrapInClient(async function ({ math }) {
      const result = await math.divide(10, 0);

      expect(result.ok).toEqual(false);
      if (!result.ok) {
        // Expect stack is non-empty
        expect((result as any)._stack !== '').toBeTruthy();
      }
    })
  );
});
