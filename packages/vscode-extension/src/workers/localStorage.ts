import { SchemaType, merge } from '@tkww-assistant/dependencies';
import { constants, Log } from '@tkww-assistant/utils';
import { QueryWrapper } from 'query-ast';
import { ExtensionContext, workspace, WorkspaceConfiguration, commands } from 'vscode';
import utils from './utils';

const configuration: WorkspaceConfiguration = workspace.getConfiguration(constants.configurationSection);

interface LocalStorageConfig {
  context: ExtensionContext
  logger: Log.Logger;
  wrapper: QueryWrapper<SchemaType>;
}

interface ClearLocalStorageConfig {
  context: ExtensionContext
  logger: Log.Logger;
}

const localStorage = (): boolean => {
  const currentSetting = configuration.get<Settings.Public['localStorage']>('localStorage');
  return currentSetting || false
};

const setStorageDependencies = (config: LocalStorageConfig) => {
  const { context, logger, wrapper } = config;
  if (localStorage()) {
    const currentStorage = (context.workspaceState.get('dependencies') || []) as WorkspaceState.Dependencies[];
    const nodes = currentStorage.map((currentStore) => {
      logger(`Loaded ${currentStore.nameVersion} from workplace state.`, 0);
      return currentStore.wrapper
    });
    const current = wrapper.get(0);
    const newWrapper = merge.nodes(nodes, current);
    logger(' ');
    commands.executeCommand('setContext', 'extension:clearLocalStorage', true);
    return newWrapper;
  }
  return wrapper;
};

const toggleLocalSetting = (config: LocalStorageConfig) => {
  const { context, wrapper, logger } = config;
  if (context) {
    if (localStorage()) {
      storeNewDependencies(utils.buildWrappers(wrapper, logger), context);
      commands.executeCommand('setContext', 'extension:clearLocalStorage', true);
      return;
    }
    clearStorageDependencies(config);
  }
}

const clearStorageDependencies = (config: ClearLocalStorageConfig) => {
  const { context, logger } = config

  context.workspaceState.update('dependencies', undefined);
  logger(`Cleared workplace state.`, 0);

  commands.executeCommand('setContext', 'extension:clearLocalStorage', false);
};

const storeNewDependencies = (wrappers: WorkspaceState.Dependencies[], context: ExtensionContext) => {
  if (localStorage() && context) {
    const { workspaceState } = context;
    // Get current storage.
    const currentStorage = workspaceState.get('dependencies', []) as WorkspaceState.Dependencies[];

    // Filter duplicates.
    const newState = currentStorage.concat(wrappers).filter(
      (dependency, index, self) =>
        index === self.findIndex(
          (d) => d.nameVersion === dependency.nameVersion
        ),
    );

    // Set to state.
    context.workspaceState.update('dependencies', newState);
    commands.executeCommand('setContext', 'extension:clearLocalStorage', true);
  }
};

export default {
  clearStorageDependencies,
  setStorageDependencies,
  storeNewDependencies,
  toggleLocalSetting,
}