import { z } from 'zod';
import { withIntrospection, method } from './server';

export default withIntrospection({
  hello: method()
    .arg({ name: z.string() })
    .returns({ message: z.string() })
    .impl(({ name }) => {
      return { message: `hello, ${name}!` };
    }),
});
