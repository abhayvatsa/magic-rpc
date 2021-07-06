import { wrapInClient } from './app';

describe('Test a range of return values', () => {
  it.concurrent(
    'Synchronous method returning non-result works',
    wrapInClient(async ({ greeting }) => {
      const response = await greeting.hello('world');

      expect(response).toEqual('Hello world!');
    })
  );

  it.concurrent(
    'Asynchronous method returning non-result works',
    wrapInClient(async ({ greeting }) => {
      const result = await greeting.goodbye('old friend');

      expect(result.ok).toEqual(true);
      expect(result.val).toEqual('Goodbye old friend!');
    })
  );

  it.concurrent(
    'Asynchronous method returning Ok() works',
    wrapInClient(async ({ math }) => {
      const result = await math.subtract(10, 2);

      expect(result.ok).toEqual(true);
      expect(result.val).toEqual(10 - 2);
    })
  );

  it.concurrent(
    'Asynchronous method returning Ok()/Err() works',
    wrapInClient(async ({ math }) => {
      {
        const result = await math.multiply(10, 2);

        expect(result.ok).toEqual(true);
        expect(result.val).toEqual(10 * 2);
      }
      {
        const result = await math.multiply(Number.MAX_VALUE, Number.MAX_VALUE);

        expect(result.ok).toEqual(false);
        expect(result.val).toEqual('Number overflow');
      }
    })
  );

  it.concurrent(
    'Asynchronous method returning manually annotated Result works',
    wrapInClient(async ({ math }) => {
      {
        const result = await math.divide(10, 2);

        expect(result.ok).toEqual(true);
        expect(result.val).toEqual(10 / 2);
      }
      {
        const result = await math.divide(10, 0);

        expect(result.ok).toEqual(false);
        expect(result.val === 'Divided by zero');
      }
    })
  );
});

describe('Method error cases', () => {
  it.concurrent(
    'Test incorrect number of arguments',
    wrapInClient(async ({ greeting }) => {
      // @ts-expect-error Purposely calling with incorrect # of arguments
      const result = await greeting.hello();

      // @ts-expect-error Purposely calling with incorrect # of arguments
      expect(result.val).toEqual(
        'Invariant failed: Expected 1 arguments, received 0'
      );
    })
  );
});
