import { getPackageName, getVariables, utils as atRulesUtils, extraVariables } from '@tkww-assistant/atrules';
import { getImports } from '@tkww-assistant/dependencies';
import { accessors } from '@tkww-assistant/utils';
import { matchNodeValue } from '@tkww-assistant/convert';
import { parse, SCSSNode, StylesheetNodeType } from 'scss-parser';
import query, { QueryWrapper } from 'query-ast';
import {
  CodeLens,
  CodeLensProvider,
  Event,
  EventEmitter,
  Range,
  TextDocument,
  workspace,
  window,
  Disposable,
  DecorationRenderOptions,
} from 'vscode';
import * as utils from './utils';

type LensType = 'convert' | 'unused' | 'invalid';

export interface StyleCodeLenses {
  codeLens: CodeLens
  startLine: number
  type: LensType
}

class StyleCodeLens implements CodeLensProvider {
  private codeLensSettings: Settings.CodeLens | undefined = utils.settings();
  private codeLenses: StyleCodeLenses[] = [];
  private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
  private application: Instance.Application;
  private gutterIcons: Disposable[] = [];
  public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;

  constructor(application: Instance.Application) {
    this.application = application;
    workspace.onDidChangeConfiguration((_) => {
      this.codeLensSettings = utils.settings();
    });
  }

  public provideCodeLenses(document: TextDocument): CodeLens[] | Thenable<CodeLens[]> {
    this.codeLenses = [];
    this.gutterIcons.forEach((gutterIcon) => gutterIcon.dispose());
    const { codeLensSettings } = this;

    if (codeLensSettings && Object.values(codeLensSettings)
      .some((setting) => setting)) {
      const text = document.getText();
      const clientFile = parse<StylesheetNodeType>(text);
      const queryFile = query<StylesheetNodeType, SCSSNode>(clientFile)();
      if (codeLensSettings.findConverts || codeLensSettings.gutterIcon) {
        this.changeType(queryFile);
      }
      if (codeLensSettings.findUnusedImports || codeLensSettings.gutterIcon) {
        this.findUnused(queryFile);
      }
      if (codeLensSettings.findInvalidImports) {
        this.findInvalidImports(queryFile);
      }
    }
    return utils.getCodeLenses(this.codeLenses);
  }

  private changeType = (clientQueryWrapper: QueryWrapper<StylesheetNodeType, SCSSNode>) => {
    // Search the client for any values tha match the dependencies.
    const rules = this.application.dependencies.find('rule');
    const matches = matchNodeValue(clientQueryWrapper, rules);

    // `source` is the client value, change is the suggested change.
    matches.forEach(({ source, change }) => {
      // There will only be one node in each source, so we can get(0).
      const { start } = source.get(0);
      const changeValue = change.value();
      if (start) {
        const packageName = getPackageName.forDependency(change);

        const { column, line } = start;
        const startLine = line - 1;
        this.addGutterIcon(startLine);
        if (this.codeLensSettings?.findConverts) {
          const range = new Range(startLine, column, startLine, column + changeValue.length);
          const codeLens = new CodeLens(range);
          codeLens.command = {
            title: `${source.value()} can be converted to ${changeValue} from the ${packageName} package. Click to convert.`,
            command: "tkww.convertValue",
            arguments: [{
              source,
              change,
            }],
          };
          this.codeLenses.push({
            codeLens,
            startLine,
            type: 'convert',
          });
        }
      }
    });
  };

  private findInvalidImports = (clientWrapper: QueryWrapper<StylesheetNodeType, SCSSNode>) => {
    const atRules = atRulesUtils.getAtValueRules(clientWrapper);

    for (let i = 0; i < atRules.length(); i += 1) {
      const currentAtRule = atRules.eq(i);
      const { start } = currentAtRule.get(0);
      const locations = getPackageName.forAtValue(currentAtRule)[0];
      const dependencyImports = getImports(this.application.dependencies.find('rule'));
      const dependency = dependencyImports.find(({ dependencyImport }) => dependencyImport === locations);
      if (dependency && start) {
        const { line, column } = start;
        const startLine = line - 1;

        const identifiers = utils.getDependencyVariables(dependency);

        const invalidVariables = getVariables(currentAtRule, true)
          .find(({ node }) => !identifiers.includes(node.value.toString()
            .trim()));

        if (invalidVariables.length() > 0) {
          const changes = invalidVariables
            .map(({ node }) => node.value.toString())
            .reverse() as string[];
          this.addGutterIcon(startLine);

          const changeValue = accessors.changeValue(changes);

          const range = new Range(startLine, column, startLine, column + changeValue.length);
          const codeLens = new CodeLens(range);
          const plural = changes.length > 1;
          codeLens.command = {
            title: `The variable${plural ? 's' : ''} ${changeValue} ${plural ? 'are' : 'is'} invalid. Click to remove.`,
            command: "tkww.removeVariables",
            arguments: [invalidVariables],
          };
          this.codeLenses.push({
            codeLens,
            startLine,
            type: 'invalid',
          });
        }
      }
    }
  };

  private findUnused = (clientQueryWrapper: QueryWrapper<StylesheetNodeType, SCSSNode>) => {
    const unusedVariablesArray = extraVariables(clientQueryWrapper)
      .filter((unusedVariables) => unusedVariables.length() > 0);

    unusedVariablesArray.forEach((unusedVariables) => {
      const unusedVariablesAt = unusedVariables
        .first()
        .parents<StylesheetNodeType>('atrule');
      const packageName = getPackageName.forAtValue(unusedVariablesAt)[0];
      const dependencyImports = getImports(this.application.dependencies.find('rule'));
      const dependency = dependencyImports.find(({ dependencyImport }) => dependencyImport === packageName);
      const identifiers: string[] = utils.getDependencyVariables(dependency);
      const unusedValidVariables = unusedVariables
        .find(({ node }) => identifiers.includes(node.value.toString()
          .trim()));
      if (dependency && unusedValidVariables.length() > 0) {
        const { start } = unusedValidVariables.get(0);
        const changeValueArray = unusedValidVariables
          .map((node) => node.toJSON().value)
          .reverse() as string[];

        const changeValue = accessors.changeValue(changeValueArray);

        if (start) {
          const { column, line } = start;
          const startLine = line - 1;
          this.addGutterIcon(startLine);
          if (this.codeLensSettings?.findUnusedImports) {
            const plural = changeValueArray.length > 1;
            const range = new Range(startLine, column, startLine, column + changeValue.length);
            const codeLens = new CodeLens(range);
            codeLens.command = {
              title: `The variable${plural ? 's' : ''} ${changeValue} ${plural ? 'are' : 'is'} not used in this file. Click to remove.`,
              command: "tkww.removeVariables",
              arguments: [unusedValidVariables],
            };
            this.codeLenses.push({
              codeLens,
              startLine,
              type: 'unused',
            });
          }
        }
      }
    });
  };

  private addGutterIcon = (line: number) => {
    const editor = window.activeTextEditor;

    if (editor && this.codeLensSettings?.gutterIcon) {
      const decorationRenderOptions: DecorationRenderOptions = {
        gutterIconPath: utils.gutterIconPath(this.application.context),
        gutterIconSize: 'contain',
      };

      const range = new Range(line, 0, line, 0);
      const decoration = window.createTextEditorDecorationType(decorationRenderOptions);
      this.gutterIcons.push(decoration);
      editor.setDecorations(decoration, [range]);
    }
  };
}

export default StyleCodeLens;
