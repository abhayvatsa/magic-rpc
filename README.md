
# magic-rpc [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/abhayvatsa/magic-rpc/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/magic-rpc.svg?style=flat)](https://www.npmjs.com/package/magic-rpc)

A typesafe RPC framework with compile-time error checking.

![magic-rpc intellisense demo](https://user-images.githubusercontent.com/15083292/126031479-4bd6f493-3207-4e7b-a63d-dc4fa0e7a2bb.gif)

🤔 Why is this useful?

You can think of `magic-rpc` as a way to write APIs _quickly_ and [typed]
_safely_. It avoids the clunkiness of REST and the boilerplate/complexity of
GraphQL.

<details>

<summary>👩🏼‍🏫 I want more boring details!</summary>

**Motivation:**

It helps to have correctness guarantees from your compiler when writing your
programs. This is applicable when writing client-server applications, but
requires some tooling to achieve.

To this end, we can use an RPC client that is aware of the return type of the
server response. We will encode the _data type_ and _error type_ into the return
type of an RPC method. The client will _infer_ the type of the RPC
method enabling the compiler to know about data and error types. The compiler
will enforce appropriate error handling on the client: providing us
strongly-typed client-server code.

**Inspiration:**

This project is loosely based on
[JSON RPC](https://www.jsonrpc.org/specification).

Our error propagation is inspired by
[Rust's Result type](https://doc.rust-lang.org/std/result/), which returns a
tuple of `Result<T, E>` from a function. Here `T` is your data type and `E` is
your error type.

</details>

## Install

```bash
npm i magic-rpc
```

<details>

<summary>
⚠️ IMPORTANT: You must enable `strictNullChecks` in your `tsconfig.json`.
</summary>

Typescript currently has a
[bug](https://github.com/microsoft/TypeScript/issues/10564), making type
narrowing only work when `strictNullChecks` is turned on.

```jsonc
// tsconfig.json
{
  // ...
  "compilerOptions": {
    // ...
    "strictNullChecks": true
  }
}
```

</details>

## Features

### 🪄 Magical type inference

Invoke methods in your client code with type guarantees but **without strange
`import` paths**.

### ⚡️ Fast Developer Experience

No code generation is required, speeding up your iteration! Minimal boilerplate
and intuitive syntax. Looks just like method invocations. Tiny library
footprint.

### 🔍 Observability

See stack traces from server code in development

### 🚧 Easy to try in an existing project

Can be gradually deployed into your project.
Designed to be agnostic to front-end framework choice.

## Usage

### Simple Example

Invoking an RPC method from your client _looks_ like calling a function defined
on your server.

```typescript
const quotient = await math.divide(10, 2);
```

Create a client that is aware of the return types of your methods.

```typescript
// client.ts
import { createClient } from 'magic-rpc';
import fetch from 'cross-fetch';
import type { Services } from './server';

export async function main() {
  // Create an RPC Client
  const { math } = createClient<Services>(`http://localhost:8080/rpc`, fetch);

  // Invoke method on RPC client (crosses network boundary)
  const response = await math.divide(10, 2); // TS is aware of types

  console.log(response);
}
```

Finally, this is what configuring your server looks like.

```typescript
// server.ts
import { createRpcHandler, Request } from 'magic-rpc';
import express from 'express';

// Define some services
const services = {
  math: {
    divide(_: Request, x: number, y: number) {
      return x / y;
    },
  },
};

// Client will import these for the RpcClient
export type Services = typeof services;

// Configure server
export const app = express();
app.use(express.json());
app.post('/rpc', createRpcHandler(services));
```

<details>

<summary>
What does a `curl` command look like?
</summary>

```bash
$ curl localhost:8080/rpc \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{
    "service": "math",
    "method": "divide",
    "params": [99, 3]
  }'
{"result":{"ok":true,"err":false,"val":33}}
```

</details>

## Alternatives

- [loopback-next](https://github.com/strongloop/loopback-next)
- [trpc](https://github.com/vriad/trpc)
- [jsonrpc-ts](https://github.com/shekohex/jsonrpc-ts)
- [rpc_ts](https://github.com/aiden/rpc_ts)
- [ts-alias](https://github.com/coffeemug/ts-alias)
