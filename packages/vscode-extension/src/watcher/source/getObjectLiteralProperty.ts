import ts from 'typescript';
import { removeMaybeOuter } from '../util';

const getObjectLiteralProperty = (
  objectLiteral: ts.ObjectLiteralExpression,
  propertyValue?: ts.__String,
): ts.ObjectLiteralElementLike | null => {
  const value = objectLiteral.properties.find((property) => {
    if (!property.name) {
      return false;
    }
    const nameText = removeMaybeOuter(property.name.getText());
    return nameText === propertyValue;
  });
  return value || null;
};

export default getObjectLiteralProperty;
