import type * as express from 'express';
import { NextApiRequest, NextApiResponse } from 'next';

export type Request = express.Request | NextApiRequest;
export type Response = express.Response | NextApiResponse;
export type NextFunction = express.NextFunction;
