import { Request } from '../../';

export default {
  readFile() {
    return; // To implement
  },

  _superSecretMethod(_req: Request) {
    return 'serverSideSecret';
  },
};
