# magic-rpc [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/abhayvatsa/magic-rpc/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/magic-rpc.svg?style=flat)](https://www.npmjs.com/package/magic-rpc)

A typesafe RPC framework with compile-time error checking.

![intellisense-works-great](https://user-images.githubusercontent.com/15083292/124224599-d2c79700-daba-11eb-8e79-b35dbce50ef8.mp4)

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
type of an RPC method. The client will _infer_ the return type from the RPC
method enabling the compiler to know about data and error types. The compiler
will enforce appropriate error handling on the client: providing us
strongly-typed client-server code.

Our error propagation is inspired by
[Rust's Result type](https://doc.rust-lang.org/std/result/), which returns a
tuple of `Result<T, E>` from a function. Here `T` is your data type and `E` is
your error type.

**Inspiration:**

This project is loosely based on
[JSON RPC](https://www.jsonrpc.org/specification).

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

### 🪄 **Magical type inference**

Invoke methods in your client code with type guarantees but **without strange
`import` paths**.

### ⚡️ **Fast Developer Experience**

No code generation is required, speeding up your iteration!

### 😌 **Minimal boilerplate**

Intuitive syntax without complexity. Looks just like method invocations.

### 😓 **No run-time bloat**

Compiled output requires no runtime code. Tiny library footprint.

### 🔍 **Observability**

See stack traces from server code in development

### 🚧 Easy to try in an existing project

Can be easily deployed into an brownfield project for a small part of your app.
Zero dependencies, and designed to play well with all front-end framework.

## Usage

Invoking an RPC method from your client _looks_ like calling a function defined
on your server.

```typescript
// Note: `divide` is a remote procedure call and goes over a network boundary
const result = await divide(10, 0);
```

Server methods functions have a return type of `Result<T, E>` or
`Ok<T> | Err<E>`). Below, the return type of `divide` has a return type of
`Result<number, 'Divided by zero'>` or `Ok<number> | Err<'Divided by zero'>`

Create a client that is aware of the return types of your methods.

```typescript
// client.ts
import { createClient } from 'magic-rpc';
import type { Services } from './server';

// Create RPC client
const { math } = createClient<Services>(`http://localhost:8080/rpc`);

// Invoke method on RPC client
const result = await math.divide(10, 0); // result: Result<number, 'Divided by zero'>

// TS now forces you to check whether you have a valid result at compile time.
if (result.ok) {
  const quotient = result.val; //  type narrowing guarantees `quotient` is a `number`
  console.log(`Success: ${quotient}`);
} else {
  const err = result.val;
}
```

Finally, this is what configuring your server looks like.

```typescript
// server.ts
import { createRpcHandler, Ok, Err } from 'magic-rpc';
import express from 'express';

// These are methods the server will expose
const services = {
  math: {
    divide(
      _req,
      x: number,
      y: number
    )> : Result<number, 'Divided by zero'>{
      if (y === 0) {
        return Err('Divided by zero')
      } else {
        return Ok(x / y)
      }
    },
  }
}

export type Services = typeof services

// Configure express server
const app = express();
app.use(express.json());
app.post('/rpc', createRpcHandler(services));

// Start server
app.listen(8080);
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
