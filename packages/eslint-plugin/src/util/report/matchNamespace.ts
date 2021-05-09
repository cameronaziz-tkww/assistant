import type { TSESTree, TSESLint } from '@typescript-eslint/experimental-utils';
import * as typeguards from '../../typeguards';

interface BaseConfig <
  T extends RequiredMessages,
  U extends readonly unknown[],
>{
  context: TSESLint.RuleContext<T, U>;
  expectedNamespace: string;
}

interface ActionTypesMatchConfig <
  T extends RequiredMessages,
  U extends readonly unknown[],
> extends BaseConfig<T, U>{
  node: TSESTree.TypeNode;
}

interface DiveLeftConfig <
  T extends RequiredMessages,
  U extends readonly unknown[],
> extends BaseConfig<T, U>{
  node: TSESTree.TSQualifiedName;
  currentName: string;
}

type RequiredMessages =
  | 'outsideNamespace';

interface MatchNamespaceValue {
  node: TSESTree.TSQualifiedName;
  name: string;
}

function diveLeft<
  T extends RequiredMessages,
  U extends readonly unknown[],
  V extends boolean,
>(config: DiveLeftConfig<T, U>, noDive?: false): MatchNamespaceValue;
function diveLeft<
  T extends RequiredMessages,
  U extends readonly unknown[],
  V extends boolean,
>(config: DiveLeftConfig<T, U>, noDive?: boolean): MatchNamespaceValue | null;
function diveLeft<
  T extends RequiredMessages,
  U extends readonly unknown[],
  V extends boolean,
>(config: DiveLeftConfig<T, U>, noDive?: V) {
  const { node, context, expectedNamespace, currentName } = config;
  const { left: namespace, right: member } = node;
  const separator = currentName.length > 0 ? '.' : '';
  const memberName = `${member.name}${separator}${currentName}`;

  // Namespaces on namespaces
  if (typeguards.isTSQualifiedName(namespace)) {
    if (noDive) {
      const diveResult = diveLeft({
        context,
        expectedNamespace,
        node: namespace,
        currentName: memberName,
      }, false);
      if (diveResult) {
        context.report({
          node,
          messageId: 'outsideNamespace' as T,
          data: {
            member: diveResult.name,
            expectedNamespace,
          },
        });
      }
      return null;
    }
    return diveLeft(
      {
        context,
        expectedNamespace,
        node: namespace,
        currentName: memberName,
      },
      noDive,
    );
  }
  const name = `${namespace.name}.${memberName}`;

  // Not correct namespace
  if (
    typeguards.isIdentifier(namespace)
    && namespace.name !== expectedNamespace
  ) {
    context.report({
      node,
      messageId: 'outsideNamespace' as T,
      data: {
        member: name,
        expectedNamespace,
      },
    });
  }
  return {
    name,
    node,
  };
}

function matchNamespace<
  T extends RequiredMessages,
  U extends readonly unknown[],
  V extends boolean,
>(config: ActionTypesMatchConfig<T, U>, noDive?: false): MatchNamespaceValue;
function matchNamespace<
  T extends RequiredMessages,
  U extends readonly unknown[],
  V extends boolean,
>(config: ActionTypesMatchConfig<T, U>, noDive?: boolean): MatchNamespaceValue | null;
function matchNamespace<
  T extends RequiredMessages,
  U extends readonly unknown[],
  V extends boolean,
>(config: ActionTypesMatchConfig<T, U>, noDive?: V) {
  const { context, node, expectedNamespace } = config;

  if(!typeguards.isTSTypeReference(node)) {
    // Is this even a type?
    context.report({
      node,
      messageId: 'outsideNamespace' as T,
      data: {
        member: '',
      },
    });
    return null;
  }

  const { typeName } = node;

  // Not in namespace
  if (!typeguards.isTSQualifiedName(typeName)) {
    context.report({
      node,
      messageId: 'outsideNamespace' as T,
      data: {
        member: typeName.name,
      },
    });
    return null;
  }

  return diveLeft(
    {
      context,
      currentName: '',
      expectedNamespace,
      node: typeName,
    },
    noDive,
  );
}

export default matchNamespace;
