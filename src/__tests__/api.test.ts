import { wrapInClient, Client } from './app';

describe('API', () => {
  it.concurrent(
    'Test a synchronous method returning non-Result',
    wrapInClient(async ({ hello }: Client) => {
      const result = await hello('world');

      expect(result.ok).toEqual(true);
      expect(result.val).toEqual('Hello world!!');
    })
  );

  it.concurrent(
    'Test an asynchronous method returning non-Result',
    wrapInClient(async ({ goodbye }: Client) => {
      const { val } = await goodbye('abhay');

      expect(val).toEqual('Goodbye abhay!');
    })
  );

  it.concurrent(
    'Test an asynchronous method return OkImpl',
    wrapInClient(async ({ getUnixTime }: Client) => {
      const { ok, val } = await getUnixTime();

      expect(ok && typeof val === 'number');
    })
  );

  it.concurrent(
    'Test an asynchronous method returning OkImpl/ErrImpl',
    wrapInClient(async ({ getPeople }: Client) => {
      const result = await getPeople();

      expect(
        (result.err && result.val === 'ahh!') ||
          (result.ok && result.val.length === 3)
      ).toEqual(true);
    })
  );

  it.concurrent(
    'Test an asynchronous method returning Result',
    wrapInClient(async ({ divide }: Client) => {
      const result = await divide(10, 0);

      expect(result.ok).toEqual(false);
      expect(result.val === 'Divided by zero').toBeTruthy();
      if (!result.ok) {
        expect(result.stack).toBeTruthy();
      }
    })
  );
});
