// client.ts
import fetch from 'cross-fetch';
import { createClient } from 'magic-rpc';
import { Services } from './server';

export async function main() {
  // Create an RPC Client
  const { math } = createClient<Services>(`http://localhost:8080/rpc`, fetch);

  const result = await math.divide(10, 2); // Invoke method on RPC client

  // NOTE: TypeScript enforces error checking through type narrowing.
  if (result.ok) {
    const quotient = result.val;
    console.log(`quotient: ${quotient}`);
  } else {
    console.log(`FAILURE: ${result.val}`);
  }
}
