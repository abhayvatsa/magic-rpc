import { wrapInClient } from './app';

describe('API', () => {
  it.concurrent(
    'Test a synchronous method returning non-Result',
    wrapInClient(async ({ greeting }) => {
      const result = await greeting.hello('world');

      expect(result.ok).toEqual(true);
      expect(result.val).toEqual('Hello world!!');
    })
  );

  it.concurrent(
    'Test incorrect number of arguments',
    wrapInClient(async ({ greeting }) => {
      // @ts-expect-error Purposely calling with incorrect # of arguments
      const result = await greeting.hello();

      expect(result.ok).toEqual(false);
      expect(result.val).toEqual(
        'Invariant failed: Expected 1 arguments, received 0'
      );
    })
  );

  it.concurrent(
    'Test an asynchronous method returning non-Result',
    wrapInClient(async ({ greeting }) => {
      const { val } = await greeting.goodbye('abhay');

      expect(val).toEqual('Goodbye abhay!');
    })
  );

  it.concurrent(
    'Test an asynchronous method return OkImpl',
    wrapInClient(async ({}) => {})
  );

  it.concurrent(
    'Test an asynchronous method returning OkImpl/ErrImpl',
    wrapInClient(async ({}) => {})
  );

  it.concurrent(
    'Test an asynchronous method returning Result',
    wrapInClient(async ({}) => {})
  );
});
