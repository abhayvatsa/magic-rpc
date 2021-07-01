import { createClient } from 'magic-rpc';
import { Services } from './services/';

export const client = createClient<Services>(
  'http://localhost:3000/api/rpc/',
  fetch
);
