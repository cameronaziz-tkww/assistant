/// <reference types="types-scss-parser" />
import { DependencyImportLocation } from '@tkww-assistant/dependencies';
import { SCSSNode } from 'scss-parser';
import { Uri, ExtensionContext } from 'vscode';
import { StyleCodeLenses } from './StyleCodeLens';
export declare const getCodeLenses: (codeLenses: StyleCodeLenses[]) => import("vscode").CodeLens[];
export declare const settings: () => Settings.CodeLens | undefined;
export declare const getDependencyVariables: (dependency?: DependencyImportLocation<SCSSNode> | undefined) => string[];
export declare const gutterIconPath: (context: ExtensionContext) => Uri;
