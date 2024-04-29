import { Request, Ok, Err, Result } from '../../';
import promises from 'fs/promises';

export default {
  async readFile(
    _: Request,
    path: string
  ): Promise<Result<string, `could not open file` | 'no such file'>> {
    try {
      return Ok(await promises.readFile(path, 'utf8'));
    } catch (err) {
      if (err instanceof Object && 'code' in err && err?.code === 'ENOENT') {
        return Err('no such file');
      }
      return Err('could not open file');
    }
  },

  _superSecretMethod(_: Request) {
    return 'serverSideSecret';
  },
};
