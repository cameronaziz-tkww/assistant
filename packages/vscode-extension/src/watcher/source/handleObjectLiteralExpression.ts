import ts from 'typescript';
import { removeMaybeOuter } from '../util';
import type { RouterConfig } from '../types';
import router from './router';

const handleObjectLiteralExpression = (
  config: RouterConfig,
  objectLiteral: ts.ObjectLiteralExpression
) => {
  const value = objectLiteral.properties.find((property) => {
    if (!property.name) {
      return false;
    }
    const nameText = removeMaybeOuter(property.name.getText());
    return nameText === config.lastSource;
  });

  if (!value) {
    return config.node;
  }

  config.node = value;

  return router(config);
};

export default handleObjectLiteralExpression;
