import type { TSESLint } from '@typescript-eslint/experimental-utils';
import { allMessages, MessageIds, getMessageId } from '../util/messages';
import determineShouldRun from '../util/determineShouldRun';
import type { Options } from '../types';
import { BASE_RULE_SCHEMA } from '../util/constants';

const messages = allMessages['redux-state-file-naming'];

const meta: TSESLint.RuleMetaData<MessageIds<'redux-state-file-naming'>> = {
  type: 'suggestion',
  messages,
  schema: BASE_RULE_SCHEMA,
};

const rule: TSESLint.RuleModule<MessageIds<'redux-state-file-naming'>, Options.BaseRule> = {
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

    if (!shouldRun) {
      return {};
    }

    const { moduleNameRaw, file, fileExtension } = shouldRun;

    const ruleListener: TSESLint.RuleListener = {
      Program: (node) => {
        const goodStateFile = determineShouldRun({
          context,
          globPatterns: 'goodState',
          consumerOptions,
        });

        if (!goodStateFile) {
          return;
        }

        if (!goodStateFile.isMatchedFile) {
          context.report({
            node,
            messageId: getMessageId('fileInSubdirectory', context),
          });
        }

        const filePieces = file.split('.');
        if (filePieces.length > 2) {
          const isTestFile = file.includes('.test.');
          context.report({
            node,
            messageId: getMessageId('badFilename', context),
            data: {
              file,
              moduleNameRaw,
              help: isTestFile ? ' - Is this a test file?' : '',
            },
          });
        }

        if (fileExtension !== 'ts') {
          context.report({
            node,
            messageId: getMessageId('nonTSFile', context),
            data: {
              extension: fileExtension,
            },
          });
        }
      },
    };
    return ruleListener;
  },
};

export default rule;
