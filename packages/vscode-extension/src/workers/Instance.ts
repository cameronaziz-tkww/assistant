import { findPackageJSON, StandardOptions, SchemaNodeType, SchemaType, buildDependencies, merge, ReadPackageJSON, helpers } from '@tkww-assistant/dependencies';
import { constants, Log } from '@tkww-assistant/utils';
import { QueryWrapper, JSONNode } from 'query-ast';
import { SCSSNode } from 'scss-parser';
import { commands, ExtensionContext, workspace, WorkspaceConfiguration, window, OutputChannel, Disposable, TextDocument } from 'vscode';
import initialize from './initialize';
import utils from './utils';
import { fileSystem } from '../utils';
import localStorage from './localStorage';

const isInstanceApplication = (unknown: Initializer | Instance.Application): unknown is Instance.Application => unknown.hasStarted

export interface InitialCallback {
  (queryWrapper: QueryWrapper<SchemaNodeType, SCSSNode>): QueryWrapper<SchemaNodeType, SCSSNode>
}

class Initializer {
  hasInitialized: boolean = false;
  hasStarted: boolean = false;
  context?: ExtensionContext;
  private allDependencies: QueryWrapper<SchemaType> = merge.getBase();
  private dependencies: QueryWrapper<SchemaType> = merge.getBase();
  private disposables: Disposable[] = [];
  private outputChannel?: OutputChannel;

  public start = (context: ExtensionContext) => {
    this.context = context;
    const outputChannel = window.createOutputChannel('TKWW Assistant');
    this.outputChannel = outputChannel;
    this.disposables.push(outputChannel);
    this.allDependencies = localStorage.setStorageDependencies({
      context,
      logger: this.log,
      wrapper: this.allDependencies,
    });
    this.hasStarted = true;
    if (this.autoStart) {
      if (window.activeTextEditor) {
        this.build(window.activeTextEditor.document);
      }
      if (isInstanceApplication(this)) {
        initialize(this);
      }
      this.hasInitialized = true;
    }
    this.listener();
  }

  public shutDown = () => {
    this.hasStarted = false;
    this.disposables.forEach((disposable) => disposable.dispose());
  }

  public get register() {
    return commands.registerCommand(
      'tkww.initializeExtension',
      () => {
        if (isInstanceApplication(this)) {
          initialize(this);
        }
      });
  };

  public log: Log.Logger = (message, level): void => {
    const levelMessage = typeof level !== 'undefined' ? `[${utils.logLevel(level)}]: ` : ''
    this.outputChannel?.appendLine(`${levelMessage}${message}`)
  };

  private build = async (textDocument: TextDocument) => {
    if (!constants.supportedLanguageExt.includes(textDocument.languageId) || !this.context) {
      return;
    }
    // Show a status bar item.
    const statusBarItem = window.createStatusBarItem(1);
    statusBarItem.text = '$(sync~spin) TKWW Assistant: Parsing Dependencies';
    statusBarItem.show();
    // Get current workspace.
    const currentWorkspace = workspace.getWorkspaceFolder(textDocument.uri);
    if (currentWorkspace) {
      const workspacePath = currentWorkspace.uri.path;

      const options: StandardOptions = {
        logger: this.log,
        readCallbacks: {
          file: fileSystem.readFileCallback,
          findFiles: fileSystem.findFilesCallback,
        },
        inDevelopment: true,
      };

      // Use provided document and backtrace up to find package.json's that have the supported dependencies.
      const supportedDependencies = await findPackageJSON({
        path: textDocument.fileName,
        workspacePath,
        options,
      });

      // Determine which dependencies have not been retreived.
      const packageJSONs = helpers.neededDependencies(this.allDependencies, supportedDependencies);
      if (packageJSONs.length > 0) {
        // Backtrace up tree to find dependency folder and build query wrappers
        const wrappers = await buildDependencies({
          packageJSONs,
          workspacePath,
        });
        wrappers.forEach((currentWrapper) => {
          const nameVersion = utils.getNameVersion(currentWrapper);
          this.log(`Retrieved ${nameVersion} from dependencies.`, 0);
        });
        // Store in local state.
        localStorage.storeNewDependencies(
          utils.buildNewWrappers(wrappers, this.log),
          this.context
        );
        // Combine new query wrappers with current allDependencies
        this.allDependencies = merge.wrappers(wrappers, this.allDependencies);
      }

      // Set this.depenendencies with textDocument's supported dependencies
      this.setDependencies(supportedDependencies);
    }

    // Remove status message.
    statusBarItem.dispose();
  };

  private setDependencies = (packageJSONs: ReadPackageJSON.Success[]) => {
    const dependencyNodes: JSONNode<SchemaType>[] = [];

    packageJSONs.forEach((packageJSON) => {
      // Find the dependency within this.allDependencies.
      const dependency = helpers.matchPackageJSON(packageJSON, this.allDependencies);
      if (dependency.length() > 0) {
        // Retreive the JSONNode
        const JSONNode = dependency.get(0);
        dependencyNodes.push(JSONNode);

        // Find if this.dependencies contains this dependency and log if it doesn't.
        if (helpers.matchPackageJSON(packageJSON, this.dependencies).length() === 0) {
          const nameVersion = utils.getNameVersion(dependency);
          this.log(`Set ${nameVersion} active.`, 0);
        }
      }
    });

    // Take the nodes and build a new Query Wrapper.
    const newDependencies = merge.nodes(dependencyNodes);

    // Log if any dependencies are being dropped.
    utils.logDroppedDependencies({
      newDependencies,
      existingDependendencies: this.dependencies,
      log: this.log,
    });

    // Set dependencies.
    this.dependencies = newDependencies;
  }

  private listener = () => {
    // Listen to configuration changes.
    const onDidChangeConfiguration = workspace.onDidChangeConfiguration(
      (event) => {
        if (event.affectsConfiguration(constants.configurationSection) && this.context) {
          localStorage.toggleLocalSetting({
            context: this.context,
            wrapper: this.allDependencies,
            logger: this.log,
          });
          if (this.autoStart && !this.hasInitialized) {
            if (isInstanceApplication(this)) {
              initialize(this);
            }
          }
        }
      }
    );
    this.disposables.push(onDidChangeConfiguration);

    // Listen to opening of files.
    const onDidOpenTextDocument = workspace.onDidOpenTextDocument(
      (textDocument) => {
        this.build(textDocument);
      }
    );
    this.disposables.push(onDidOpenTextDocument);
  };

  private get configuration(): WorkspaceConfiguration {
    return workspace.getConfiguration(constants.configurationSection);
  }

  private get autoStart(): boolean {
    const currentSetting = this.configuration.get<Settings.Public['start']>('start');
    return currentSetting === 'Always' ? true : false
  };
}

export default Initializer;
