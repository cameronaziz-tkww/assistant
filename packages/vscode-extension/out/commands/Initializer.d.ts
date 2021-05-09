/// <reference types="types-query-ast" />
/// <reference types="types-scss-parser" />
import { SchemaNodeType } from '@tkww-assistant/dependencies';
import { QueryWrapper } from 'query-ast';
import { SCSSNode } from 'scss-parser';
import { ExtensionContext, WorkspaceConfiguration } from 'vscode';
export interface InitialCallback {
    (queryWrapper: QueryWrapper<SchemaNodeType, SCSSNode>): QueryWrapper<SchemaNodeType, SCSSNode>;
}
declare class Initializer {
    hasInitialized: boolean;
    context: ExtensionContext;
    private workspaceIndex;
    private allDependencies;
    configuration: WorkspaceConfiguration;
    constructor(context: ExtensionContext);
    command: import("vscode").Disposable;
    private listener;
    setDependencies: (allDependencies: QueryWrapper<SchemaNodeType, SCSSNode>[]) => void;
    get dependecyASTQ(): QueryWrapper<SchemaNodeType, SCSSNode>;
    private setCurrentDependency;
    private autoStart;
}
export default Initializer;
