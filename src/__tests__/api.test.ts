import { wrapInClient } from './app';

describe('API', () => {
  it.concurrent(
    'Test a synchronous method returning non-Result',
    wrapInClient(async ({ hello }) => {
      const result = await hello('world');

      expect(result.ok).toEqual(true);
      expect(result.val).toEqual('Hello world!!');
    })
  );

  it.concurrent(
    'Test incorrect number of arguments',
    wrapInClient(async ({ hello }) => {
      // @ts-expect-error Purposely calling with incorrect # of arguments
      const result = await hello();

      expect(result.ok).toEqual(false);
      expect(result.val).toEqual(
        'Invariant failed: Expected 1 arguments, received 0'
      );
    })
  );

  it.concurrent(
    'Test an asynchronous method returning non-Result',
    wrapInClient(async ({ goodbye }) => {
      const { val } = await goodbye('abhay');

      expect(val).toEqual('Goodbye abhay!');
    })
  );

  it.concurrent(
    'Test an asynchronous method return OkImpl',
    wrapInClient(async ({ getUnixTime }) => {
      const { ok, val } = await getUnixTime();

      expect(ok && typeof val === 'number');
    })
  );

  it.concurrent(
    'Test an asynchronous method returning OkImpl/ErrImpl',
    wrapInClient(async ({ getPeople }) => {
      const result = await getPeople();

      expect(
        (result.err && result.val === 'ahh!') ||
          (result.ok && result.val.length === 3)
      ).toEqual(true);
    })
  );

  it.concurrent(
    'Test an asynchronous method returning Result',
    wrapInClient(async ({ divide }) => {
      const result = await divide(10, 0);

      expect(result.ok).toEqual(false);
      expect(result.val === 'Divided by zero').toBeTruthy();
      if (!result.ok) {
        expect(result.stack).toBeTruthy();
      }
    })
  );
});
