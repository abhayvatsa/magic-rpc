import fs from './fs';
import greeting from './greeting';

export const services = {
  fs,
  greeting,
  math: () => import('./math'),
};

export type Services = typeof services;
