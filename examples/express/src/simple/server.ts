// server.ts
import { createRpcHandler, Request } from 'magic-rpc';
import express from 'express';

// Define some services
const services = {
  greeting: {
    hello(_: Request, name: string) {
      return `Hello ${name} from rpc server`;
    },
  },
  math: {
    divide(_: Request, x: number, y: number) {
      return x / y;
    },
    square(_: Request, x: number) {
      return x * x;
    },
  },
};

// Client will import these for the RpcClient
export type Services = typeof services;

// Configure server
export const app = express();
app.use(express.json());
app.post('/rpc', createRpcHandler(services));
