import { StylesheetNodeType, HexVariables } from '@tkww-assistant/dependencies';
import { typeGuards, constants, color } from '@tkww-assistant/utils';
import query from 'query-ast';
import * as scssAST from 'scss-parser';
import { window, TextEditorDecorationType, DecorationRenderOptions, workspace, Range } from 'vscode';

class Colorizer {
  decorationTypes: TextEditorDecorationType[];
  application: Instance.Application;

  constructor(application: Instance.Application) {
    this.application = application;
    this.decorationTypes = [];
  }

  onChange = () => {
    this.decorationTypes.forEach((decorationType) => {
      decorationType.dispose();
    });
    this.analyzeFile();
  };

  onLoad = () => {
    this.analyzeFile();
  };

  private buildHexVariables = (): HexVariables => {
    const hexVariables: HexVariables = {};

    const colorHex = this.application.dependencies
      .find('rule')
      .has('color_hex');

    for (let i = 0; i < colorHex.length(); i += 1) {
      const currentColorHex = colorHex.eq(i);
      const hexValue = currentColorHex
        .find(({ node }) => node.type === 'from')
        .find(({ node }) => node.type === 'color_hex')
        .value();
      const identifierValue = currentColorHex
        .find(({ node }) => node.type === 'value')
        .find(({ node }) => node.type === 'identifier')
        .value();

      hexVariables[identifierValue] = hexValue;
    };

    return hexVariables;
  };

  private analyzeFile = () => {
    const colorize = workspace
      .getConfiguration(constants.configurationSection)
      .get<Settings.Colorize>('colorize');
    if (colorize && colorize.enable) {
      const { activeTextEditor, createTextEditorDecorationType } = window;

      if (!activeTextEditor) {
        return;
      }

      const { getText, languageId } = activeTextEditor.document;
      if (!constants.supportedLanguageExt.includes(languageId)) {
        return;
      }

      const nodeFile = scssAST.parse<StylesheetNodeType>(getText());
      const queryFile = query(nodeFile);

      const hexVariables = this.buildHexVariables();
      const isDarkTheme = window.activeColorTheme.kind === 2;

      queryFile()
        .find('identifier')
        .map((node) => {
          const { value } = node.node;
          if (typeGuards.valueIsString(value)) {
            const foundValue = hexVariables[value];
            const { start } = node.node;
            if (foundValue && start) {
              const { l } = color.hexToHSL(foundValue, true);
              const decorationRenderOptions: DecorationRenderOptions = {
                color: `#${foundValue}`,
              };
              const flip = isDarkTheme ? l < 30 : l > 70;
              if (colorize.invertBackgroundColor && flip) {
                const inverse = color.invertColor(foundValue);
                const backgroundColor = color.hexToRGB(inverse, 0.4);
                decorationRenderOptions.backgroundColor = backgroundColor;
              }
              const decorationType = createTextEditorDecorationType(decorationRenderOptions);
              this.decorationTypes.push(decorationType);
              const range = new Range(start.line - 1, start.column, start.line - 1, start.column + node.node.value.length);
              activeTextEditor.setDecorations(decorationType, [range]);
            }
          }
        });
    }
  };
}

export default Colorizer;
