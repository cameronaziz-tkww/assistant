import { TSESLint } from '@typescript-eslint/experimental-utils';
import * as Types from '../types';
import { PLUGIN_NAME } from './constants';

type Context = Readonly<TSESLint.RuleContext<string, readonly unknown[]>>;

const getUserSetting = <
  T extends Context,
  U extends keyof Types.Settings
>(context: T, setting: U) => {
  const settings = context.settings && context.settings[PLUGIN_NAME] as Types.ConsumerSettings;
  if (settings && settings[setting]) {
    return settings[setting] as Types.Settings[U];
  }

  return undefined;
};

export default getUserSetting;
