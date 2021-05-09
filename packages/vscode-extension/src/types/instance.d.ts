import { Log } from '@tkww-assistant/utils'
import { SchemaNodeType }  from '@tkww-assistant/dependencies';
import { QueryWrapper } from 'query-ast';
import { SCSSNode } from 'scss-parser';
import {
  ExtensionContext,
  WorkspaceConfiguration,
  Disposable,
  OutputChannel
} from 'vscode';

declare class Application {
  configuration: WorkspaceConfiguration;
  context: ExtensionContext;
  dependencies: QueryWrapper<SchemaNodeType, SCSSNode>;
  hasInitialized: boolean;
  hasStarted: true;
  log: Log.Logger;
  register: Disposable;
  shutDown: (contex: ExtensionContext) => void;
  start: (contex: ExtensionContext) => void;
  private allDependencies: QueryWrapper<SchemaNodeType, SCSSNode>[];
  private autoStart: () => boolean;
  private listener: () => void;
  private outputChannel: OutputChannel;
}

export as namespace Instance;