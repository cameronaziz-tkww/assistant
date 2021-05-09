import type { TSESLint } from '@typescript-eslint/experimental-utils';
import { allMessages, MessageIds, getMessageId } from '../util/messages';
import * as typeguards from '../typeguards';
import determineShouldRun from '../util/determineShouldRun';
import type { Options } from '../types';
import { BASE_RULE_SCHEMA } from '../util/constants';

const messages = allMessages['redux-state-statements'];

const meta: TSESLint.RuleMetaData<MessageIds<'redux-state-statements'>> = {
  type: 'suggestion',
  messages,
  schema: BASE_RULE_SCHEMA,
};

const rule: TSESLint.RuleModule<MessageIds<'redux-state-statements'>, Options.BaseRule> = {
  meta,
  create(context) {
    const {
      options: [
        consumerOptions,
      ],
    } = context;

    const shouldRun = determineShouldRun({
      context,
      globPatterns: 'state',
      moduleIsFile: true,
      consumerOptions,
    });

    if (!shouldRun || !shouldRun.isMatchedFile || shouldRun.fileExtension !== 'ts') {
      return {};
    }

    const { moduleName } = shouldRun;

    const ruleListener: TSESLint.RuleListener = {
      Program: (node) => {
        const isOnlyOneStatement = node.body.length === 1;
        if (isOnlyOneStatement) {
          return;
        }

        node.body.forEach((statement) => {
          if (
            typeguards.isExportNamedDeclaration(statement)
            && (
              typeguards.isTSInterfaceDeclaration(statement.declaration)
              || typeguards.isTSTypeAliasDeclaration(statement.declaration)
            )
          ) {
            const { name: exportName } = statement.declaration.id;
            if (exportName !== moduleName) {
              context.report({
                node: statement,
                messageId: getMessageId('badExport', context),
                data: {
                  moduleName,
                  exportName,
                },
              });
            }
            // Everything good
            return;
          }

          if (typeguards.isImportDeclaration(statement)) {
            if (statement.importKind === 'value') {
              const { raw } = statement.source;
              const importSpecifiers = statement.specifiers.map((specifier) => ({
                isDefault: typeguards.isImportDefaultSpecifier(specifier),
                name: specifier.local.name,
              }));
              const defaultSpecifier = importSpecifiers
                .filter((importSpecifier) => importSpecifier.isDefault)
                .map((importSpecifier) => importSpecifier.name)[0];
              const namedImports = importSpecifiers
                .filter((importSpecifier) => !importSpecifier.isDefault)
                .map((importSpecifier) => ` ${importSpecifier.name}`);

              if (defaultSpecifier && namedImports.length > 0) {
                if (statement.importKind === 'value') {
                  return;
                }
                context.report({
                  node: statement,
                  messageId: getMessageId('badTypescript', context),
                });
                return;
              }
              const suggestion = `import type ${
                defaultSpecifier || ''
              }${
                namedImports.length > 0
                  ? `{${namedImports} }` : ''
              } from ${raw};`;
              context.report({
                node: statement,
                messageId: getMessageId('importValue', context),
                data: {
                  suggestion,
                },
              });
            }
            // Other imports ok
            return;
          }

          context.report({
            node: statement,
            messageId: getMessageId('additionalStatement', context),
            data: {
              moduleName,
            },
          });
        });
      },
    };
    return ruleListener;
  },
};

export default rule;
