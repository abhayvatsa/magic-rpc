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
