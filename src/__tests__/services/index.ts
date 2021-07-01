import fs from './fs';
import greeting from './greeting';
import math from './math';

export const services = {
  fs,
  greeting,
  math,
};

export const names = (<T>(obj: T) => Object.keys(obj) as Array<keyof T>)(
  services
);

export type Services = typeof services;
