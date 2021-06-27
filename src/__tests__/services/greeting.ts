import { Request } from '../../';

export default {
  hello(_: Request, name: string) {
    return `Hello ${name}!!`;
  },

  async goodbye(_req: Request, name: string) {
    return `Goodbye ${name}!`;
  },
};
