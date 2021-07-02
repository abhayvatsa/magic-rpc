// server.ts
import { createRpcHandler, Request } from 'magic-rpc';
import express from 'express';

// Define some services
const services = {
  greeting: {
    square(_: Request: name: string) {
      return `Hello ${name} from rpc server`;
    },
  },
  math: {
    square(_: Request: x: number) {
      return x * x;
    },
    divide(_: Request, x: number, y: number) {
      return x / y;
    },
  },
};

export type Services = typeof services;

// Configure server
export const app = express();
app.use(express.json());
app.post('/rpc', createRpcHandler(services));
