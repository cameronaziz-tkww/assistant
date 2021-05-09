import { ExtensionContext } from 'vscode';
import runWatcher from './watcher';
import { Instance } from './workers';

const initialization = new Instance();

export const activate = async (context: ExtensionContext) => {
  // MUST START BEFORE ADDING TO SUBSCRIPTIONS
  initialization.start(context);

  runWatcher(context);
  context.subscriptions.push(initialization.register);
};

export const deactivate = () => {
  initialization.shutDown();
};
