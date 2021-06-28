import { Ok, Request } from '../../';

export default {
  hello(_: Request, name: string) {
    return `Hello ${name}!`;
  },

  async goodbye(_: Request, name: string) {
    return Ok(`Goodbye ${name}!`);
  },
};
