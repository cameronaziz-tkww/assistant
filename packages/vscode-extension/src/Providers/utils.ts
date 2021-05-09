import { DependencyImportLocation } from '@tkww-assistant/dependencies';
import { constants } from '@tkww-assistant/utils';
import { join } from 'path';
import { SCSSNode } from 'scss-parser';
import {
  workspace,
  Uri,
  ExtensionContext
} from 'vscode';
import  { StyleCodeLenses } from './StyleCodeLens';

export const getCodeLenses = (codeLenses: StyleCodeLenses[]) => {
  return codeLenses.map((codeLens) => codeLens.codeLens)
}

export const settings = () => {
  return workspace
    .getConfiguration(constants.configurationSection)
    .get<Settings.CodeLens>('codeLens');
}

export const getDependencyVariables = (dependency?: DependencyImportLocation<SCSSNode>): string[] => {
  if (!dependency) {
    return []
  }
  const dependencyValues = dependency
    .wrapper
    .find('rule')
    .find('value')

  const identifiers: string[] = []
  for (let j = 0; j < dependencyValues.length(); j += 1) {
    const dependencyValue = dependencyValues.eq(j);
    identifiers.push(dependencyValue.value().trim())
  }

  return identifiers
}

export const gutterIconPath = (context: ExtensionContext) => Uri.file(
  join(context.extensionPath, 'images', 'union-128.png')
);
