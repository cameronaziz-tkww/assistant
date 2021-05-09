import { TSESLint } from '@typescript-eslint/experimental-utils';
import getUserSetting from '../getUserSetting';
import { PLUGIN_NAME } from '../constants';
import { mergeDeep } from '../hidash';
import punnyMessages from './punny';
import messages from './messages';

export type RuleMessages = keyof typeof messages;
export type MessageIds<T extends keyof typeof messages> = keyof typeof messages[T];
export type Ids<T extends keyof typeof messages> = keyof typeof messages[T];
type Context<T extends string, U extends unknown[]> = Readonly<TSESLint.RuleContext<T, U>>;

type UnknownMessages = {
  [key in keyof typeof messages]: typeof unknownMessages
};

const unknownMessages = {
  unknownMessageId: 'There is an issue with this piece of code.',
  punnyUnknownMessageId: 'Well we goofed too, theres a problem but I can\'t figure out what.',
};

const nestedUnknowns = Object
  .keys(messages)
  .reduce(
    (acc, cur) => {
      acc[cur] = unknownMessages;
      return acc;
    },
    {} as UnknownMessages,
  );

export const getMessageId = <T extends string, U extends unknown[]>(
  messageId: T,
  context?: Context<T, U>,
): T => {
  if (!context) {
    return messageId;
  }

  const { id } = context;
  const rule = id.replace(`${PLUGIN_NAME}/`, '');
  const ruleMessages = allMessages[rule];
  const punny = getUserSetting(context, 'punny');

  if (!punny) {
    if (ruleMessages && !ruleMessages[messageId]) {
      return 'unknownMessageId' as T;
    }
    return messageId;
  }

  if (ruleMessages) {
    if (ruleMessages[`punny-${messageId}`]) {
      return `punny-${messageId}` as T;
    }
    if (!ruleMessages[messageId]) {
      return 'punnyUnknownMessageId' as T;
    }

  }
  return messageId;
};

export const allMessages = mergeDeep(punnyMessages, messages, nestedUnknowns);

export default allMessages;
