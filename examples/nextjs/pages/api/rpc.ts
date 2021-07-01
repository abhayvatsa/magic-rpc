import { createMiddleware } from 'magic-rpc';
import { services } from '../../services/';

export default createMiddleware(services);
