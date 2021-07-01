import { createRpcHandler } from 'magic-rpc';
import { services } from '../../services/';

export default createRpcHandler(services);
