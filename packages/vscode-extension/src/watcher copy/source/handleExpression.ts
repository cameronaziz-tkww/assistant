import { astNodeGuards } from '../typeguards';
import type { RouterConfig } from '../types';
import router from './router';
import getObjectLiteralProperty from './getObjectLiteralProperty';

const handleExpression = (config: RouterConfig) => {
  const { node, init } = config;
  if (astNodeGuards.isObjectLiteralExpression(node)) {
    const propertyValue = init.path.pop();
    const value = getObjectLiteralProperty(node, propertyValue);
    config.node = value;
  }
  return router(config);
};

export default handleExpression;
