import { Request } from '../../';

export default {
  readFile() {
    return; // To implement
  },

  _superSecretMethod(_: Request) {
    return 'serverSideSecret';
  },
};
