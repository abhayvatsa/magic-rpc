// client.ts
import fetch from 'cross-fetch';
import { createClient } from 'magic-rpc';
import type { Services } from './server';

export async function main() {
  // Create an RPC Client
  const { math } = createClient<Services>(`http://localhost:8080/rpc`, fetch);

  // Invoke method on RPC client
  const response = await math.square(10);

  console.log(response);
}
