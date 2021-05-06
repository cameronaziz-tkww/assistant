
declare const chrome: Chrome.Instance;

import * as accessors from './accessors';
import identity from './identity';
import runtime from './runtime';
import storage from './storage';

export * as accessors from './accessors';
export { default as identity } from './identity';
export { default as runtime } from './runtime';
export { default as storage } from './storage';

export default {
  ...chrome,
  storage,
  runtime,
  accessors,
  identity,
};