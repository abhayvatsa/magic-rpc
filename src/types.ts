import * as http from 'http';

export interface Request extends http.IncomingMessage {
  query: {
    [key: string]: string | string[];
  };
  cookies: {
    [key: string]: string;
  };
  body: any;
  method?: string;
  url?: string;
  statusCode?: number;
  statusMessage?: string;
}

declare type Send<T> = (body: T) => void;

export interface Response<T = any> extends http.ServerResponse {
  // Send data `any` data in response
  send: Send<T>;

  // Send data `json` data in response
  json: Send<T>;
  redirect(url: string): Response<T> | any;
  redirect(status: number, url: string): Response<T> | any;

  status: (statusCode: number) => Response<T>;
}
