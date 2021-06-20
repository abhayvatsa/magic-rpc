import { createClient } from 'magic-rpc';
import methods from './methods/';

export const client = createClient<typeof methods>(
  'http://localhost:3000/api/rpc/'
);
