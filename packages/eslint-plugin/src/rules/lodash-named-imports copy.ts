import { TSESLint, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import * as typeguards from '../typeguards';
import { allMessages, MessageIds, getMessageId } from '../util/messages';

const messages = allMessages['lodash-named-imports'];

const schema = [];

const meta: TSESLint.RuleMetaData<MessageIds<'lodash-named-imports'>> = {
  type: 'suggestion',
  messages,
  schema,
};

const rule: TSESLint.RuleModule<MessageIds<'lodash-named-imports'>, []> = {
  meta,
  create(context) {

    const ruleListener: TSESLint.RuleListener = {
      Program: (node) => {
        const imports = node.body
          .filter((bodyNode): bodyNode is TSESTree.ImportDeclaration =>
            bodyNode.type === AST_NODE_TYPES.ImportDeclaration
          );

        imports.forEach((importNode) => {
          if (importNode.source.value === 'lodash') {
            importNode.specifiers.forEach((specifier) => {
              if (typeguards.isImportSpecifier(specifier)) {
                context.report({
                  node: importNode,
                  messageId: getMessageId('namedImport', context),
                });
              }
            });
          }
        });
      },
    };
    return ruleListener;
  },
};

export default rule;
