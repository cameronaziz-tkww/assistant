import { FunctionComponent } from 'react';

export const EmptyComponent: FunctionComponent = () => null;
export const noop: App.EmptyCallback = () => {
  // Do Nothing
};
export const noopNull = (): null => null;
export const noopArray = <T>(): T[] => [];

export const secondsAgo = (seconds: number): number => {
  const milliseconds = seconds * 1000;
  return millisecondsAgo(milliseconds);
};

export const millisecondsAgo = (milliseconds: number): number =>
  new Date().getTime() - milliseconds;