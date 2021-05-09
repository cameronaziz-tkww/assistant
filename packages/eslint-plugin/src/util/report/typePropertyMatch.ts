import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import * as typeguards from '../../typeguards';
import selectId from '../selectId';
import { camelToSnake } from '../hidash';
import * as NodeHelperTypes from '../../types/NodeHelperTypes';
import { getMessageId } from '../messages';

type RequiredMessages =
  | 'badTypeValue'
  | 'badTypeValueModule'
  | 'badTypeValueName'
  | 'noTypeValue'
  | 'typeValueNotString';

type Property = TSESTree.ObjectLiteralElementLike | TSESTree.TypeElement;

interface TypeMatchConfig<
  U extends TSESTree.BaseNode,
  V extends NodeHelperTypes.NodeWithId<U>,
> {
  node: V;
  properties: Property[];
  context: Readonly<TSESLint.RuleContext<RequiredMessages, unknown[]>>;
  moduleName: string;
}

const getTypeValue = (property: Property) => {
  if (
    typeguards.isTypeElement(property)
    && typeguards.isTSPropertySignature(property)
    && typeguards.isIdentifier(property.key)
    && property.key.name === 'type'
    && property.typeAnnotation) {
    if (typeguards.isLiteralType(property.typeAnnotation.typeAnnotation)
        && typeguards.hasValue(property.typeAnnotation.typeAnnotation.literal)) {
      return {
        literalType: property.typeAnnotation.typeAnnotation,
        value: property.typeAnnotation.typeAnnotation.literal.value,
      };
    }
    return {
      literalType: property.typeAnnotation.typeAnnotation,
      value:null,
    };
  }
  if (
    typeguards.isProperty(property)
    && typeguards.isIdentifier(property.key)
    && property.key.name === 'type') {
    if (property.value && typeguards.isLiteral(property.value)) {
      return {
        literalType: property.value,
        value: property.value.value,
      };
    }
    return {
      literalType: property.value,
      value: null,
    };
  }
  return null;
};

const getValue = (id: NodeHelperTypes.NodeId) => {
  if (!id) {
    return '';
  }
  if (typeguards.isIdentifier(id)) {
    return id.name;
  }
  if (typeguards.isLiteral(id)) {
    return id.value;
  }
  return '';
};

const typePropertyMatch = <
  T extends TSESTree.Node,
  U extends NodeHelperTypes.NodeWithId<T>,
>(config: TypeMatchConfig<T, U>) => {
  const { node, context, moduleName, properties } = config;
  const { id } = node;
  if (!id) {
    return false;
  }
  const label = selectId(node);
  const idValue = getValue(id);
  const expectedName = camelToSnake(idValue);

  const expectedValue = `${moduleName}/${expectedName}`;
  const found = properties.some((property) => {
    const typeValue = getTypeValue(property);

    if (!typeValue) {
      return false;
    }

    const { value, literalType } = typeValue;

    if (!value || typeof value !== 'string') {
      context.report({
        node: label,
        messageId: getMessageId('typeValueNotString', context),
      });
      return true;
    }

    const valuePieces = value.split('/');
    const data = {
      expectedModule: moduleName,
      expectedName,
      expectedValue,
      module: valuePieces[0],
      name: valuePieces[1],
      value,
    };

    // Ensure one slash
    if (valuePieces.length !== 2) {
      context.report({
        node: literalType,
        messageId: getMessageId('badTypeValue', context),
        data,
      });
      return true;
    }

    const moduleWrong = valuePieces[0] !== moduleName;
    const nameWrong = valuePieces[1] !== expectedName;
    const { loc } = literalType;

    if (moduleWrong && nameWrong) {
      context.report({
        node: literalType,
        messageId: getMessageId('badTypeValue', context),
        data,
      });
      return true;
    }

    // Check module
    if (moduleWrong) {
      context.report({
        node: literalType,
        messageId: getMessageId('badTypeValueModule', context),
        data,
        loc: {
          ...loc,
          start: {
            ...loc.start,
            column: loc.start.column + 1,
          },
          end: {
            ...loc.end,
            column: loc.start.column + valuePieces[0].length + 1,
          },
        },
      });
      return true;
    }

    // Check type name
    if (nameWrong) {
      context.report({
        node: literalType,
        messageId: getMessageId('badTypeValueName', context),
        data,
        loc: {
          ...loc,
          start: {
            ...loc.start,
            column: loc.end.column - valuePieces[1].length - 1,
          },
          end: {
            ...loc.end,
            column: loc.end.column - 1,
          },
        },
      });
      return true;
    }

    // One final catchall check
    if (expectedValue !== value) {
      context.report({
        node: literalType,
        messageId: getMessageId('badTypeValue', context),
        data,
      });
      return true;
    }
    // All Good
    return true;
  });

  if (!found) {
    context.report({
      node: label,
      messageId: getMessageId('noTypeValue', context),
      data: {
        value: idValue,
        expectedValue,
      },
    });
  }
  return found;
};

export default typePropertyMatch;
