import type { ObjectLike } from '../../types';

export const isObjectLike = <T extends ObjectLike>(unknown?: any): unknown is T =>
  !!unknown && typeof unknown === 'object';

export const isObject = <T extends object>(unknown?: any): unknown is T =>
  isObjectLike(unknown) && !Array.isArray(unknown);
