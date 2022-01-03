import express from 'express';
import { ZodRawShape } from 'zod';
import invariant from 'tiny-invariant';
import { Methods, TypedFunction, TypedFunctionImpl } from './shared';
import { z } from 'zod';

export function method() {
  return {
    arg<TArg extends ZodRawShape>(arg: TArg) {
      return {
        returns<TRet extends ZodRawShape>(ret: TRet) {
          return {
            impl<TFunc extends TypedFunctionImpl<TArg, TRet>>(
              func: TFunc
            ): TypedFunction<TArg, TRet> {
              return {
                arg,
                ret,
                func,
              };
            },
          };
        },
      };
    },
  };
}

const getSchemaMethod = method()
  .arg({
    lang: z.string().optional(),
    pattern: z.string().optional(),
  })
  .returns({ source: z.string() });

const noopGetSchemaMethod = getSchemaMethod.impl(() => {
  throw new Error('not implemented');
});

export function withIntrospection<T extends Methods>(
  methods: T,
  isMethodIntrospectable: (methodName: string) => boolean = () => true
): T & { ['server.getSchema']: typeof noopGetSchemaMethod } {
  for (const methodName in methods) {
    invariant(
      !methodName.startsWith('server.'),
      "no method names can start with ''server.'"
    );
  }

  const methodsWithIntrospection = {
    ...methods,
    'server.getSchema': getSchemaMethod.impl(
      async ({ lang = 'schema', pattern = '*' }) => {
        const { default: minimatch } = await import('minimatch');
        const { default: camelCase } = await import('camelcase');
        const { default: zodToJsonSchema } = await import('zod-to-json-schema');
        const { quicktype, InputData, JSONSchemaInput } = await import(
          'quicktype-core'
        );

        const input = new JSONSchemaInput(undefined);

        for (const methodName in methods) {
          if (
            !minimatch(methodName, pattern) ||
            !isMethodIntrospectable(methodName)
          ) {
            continue;
          }

          await input.addSource({
            name: camelCase([methodName, 'arg']),
            schema: JSON.stringify(
              zodToJsonSchema(z.object(methods[methodName].arg))
            ),
          });
          await input.addSource({
            name: camelCase([methodName, 'ret']),
            schema: JSON.stringify(
              zodToJsonSchema(z.object(methods[methodName].ret))
            ),
          });
        }

        const inputData = new InputData();
        inputData.addInput(input);
        const source = await quicktype({
          inputData,
          lang,
        });

        return { source: source.lines.join('\n') };
      }
    ),
  };

  methods = methodsWithIntrospection;

  return methodsWithIntrospection;
}

function cached<T>(cb: () => T) {
  let value: any;
  let isCached = false;
  return () => {
    if (!isCached) {
      value = cb();
      isCached = true;
    }
    return value;
  };
}

export function createZodJsonRpcServer(
  methods: Methods | (() => Methods) | (() => Promise<Methods>)
): express.IRouter {
  const app = express.Router();
  app.use(express.json());

  const getMethods = cached(async () => {
    return typeof methods === 'function' ? methods() : methods;
  });

  const getServer = cached(async () => {
    const { JSONRPCServer } = await import('json-rpc-2.0');
    const server = new JSONRPCServer();
    const methods = await getMethods();

    for (const methodName in methods) {
      const { func } = methods[methodName];
      server.addMethod(methodName, func as any);
    }
    return server;
  });

  // convenience method for curling
  app.get('/schema', (req, res, next) => {
    (async () => {
      const methods = await getMethods();
      const getSchema = methods['server.getSchema'];
      if (!getSchema) {
        res.sendStatus(404);
        return;
      }
      const { source } = await getSchema.func(
        {
          lang: req.query.lang as string,
          pattern: req.query.pattern as string,
        },
        req,
        res
      );
      res.end(source);
    })().catch((e) => next(e));
  });

  app.post('*', (req, res, next) => {
    (async () => {
      const server = await getServer();
      const jsonRpcResponse = await server.receive(req.body);
      if (jsonRpcResponse) {
        res.json(jsonRpcResponse);
      } else {
        res.sendStatus(204);
      }
    })().catch((e) => next(e));
  });

  return app;
}
