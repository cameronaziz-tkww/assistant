import type { RuleType } from '.';

interface BaseSettings {
  development: boolean;
  punny: boolean;
}

export type Settings = {
  [key in RuleType]: string[]
} & BaseSettings;

export type ConsumerSettings = Partial<Settings> | undefined;
