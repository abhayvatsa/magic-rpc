import { wrapInClient, Client } from './app';

describe('stack', () => {
  it.concurrent(
    'Ensure stack trace exists in non-production',
    wrapInClient(async function ({ divide }: Client) {
      const result = await divide(10, 0);

      expect(result.ok).toEqual(false);
      if (!result.ok) {
        // Expect stack is non-empty
        expect((result as any)._stack !== '').toBeTruthy();
      }
    })
  );
});
