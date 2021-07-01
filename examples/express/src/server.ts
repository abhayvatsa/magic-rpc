// server.ts
import { createMiddleware, Err, Ok } from 'magic-rpc';
import express from 'express';

// Define some services
const services = {
  math: {
    async divide(_: any, x: number, y: number) {
      if (y === 0) {
        return Err('Divided by zero' as const);
      } else {
        return Ok(x / y);
      }
    },
  },
};

export type Services = typeof services;

// Configure server
export const app = express();
app.use(express.json());
app.post('/rpc', createMiddleware(services));
