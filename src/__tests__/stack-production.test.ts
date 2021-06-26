import { wrapInClient } from './app';

/* Note: this test is in a seperate file because it modifies a global variable
 * Test runner must guarantee this test runs in isolated process.
 */
describe('stack trace in production', () => {
  it(
    "Ensure we don't leak stack traces in production",
    wrapInClient(async function ({ divide }) {
      const temp = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const result = await divide(10, 0);
      process.env.NODE_ENV = temp;

      expect(result.ok).toEqual(false);
      if (!result.ok) {
        // Expect stack to be empty
        expect((result as any)._stack === '').toBeTruthy();
      }
    })
  );
});
