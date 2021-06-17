# magic-rpc [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/abhayvatsa/magic-rpc/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/magic-rpc.svg?style=flat)](https://www.npmjs.com/package/magic-rpc)

A strongly-typed RPC framework for client-server applications written in
TypeScript.

## Motivation

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

## Features

- [x] RPC Client that can propagate errors, data types, stack traces over a
      network boundary
- [ ] Stack traces and errors are anonymized/hidden in production
- [ ] Runtime type guards on client boundaries

## Usage

We define our server methods as functions with a return type of `Result<T, E>`.
This is equivalent to `Ok<T> | Err<E>`.

Note: Our function's return type conforms with
`Ok<number> | Err<'Divided by zero'>`.

```typescript
// methods.ts
import { Ok, Err } from 'magic-rpc'

// Define methods for your server logic
export const methods = {
  divide(
    _req: Request,
    x: number,
    y: number
  )> {
    if (y === 0) {
      return Err('Divided by zero' as const)
    } else {
      return Ok(x / y)
    }
  },
}
```

Create a client that is aware of the return types of your methods.

```typescript
// client.ts
import { createClient } from 'magic-rpc'
import { methods } from './methods'

// Create RPC client
const { divide } = createClient<typeof methods>(`http://localhost:8080/rpc`)

// Invoke method on RPC client
const result = await divide(10, 0)

if (result.ok) {
  const quotient: number = result.val // type narrowing guarantees `number`
} else {
  const err = result.val
}
```

Finally, this is what configuring your server looks like.

```typescript
// server.ts
import { createMiddleware } from 'magic-rpc'
import express from 'express'
import { methods } from './methods'

// Configure express server
const app = express()
app.use(express.json())
app.post('/rpc', createMiddleware(methods))

// Start server
app.listen(8080)
```

## Alternatives

- https://github.com/shekohex/jsonrpc-ts
- https://github.com/aiden/rpc_ts
- https://github.com/strongloop/loopback-next
- https://github.com/vriad/trpc
