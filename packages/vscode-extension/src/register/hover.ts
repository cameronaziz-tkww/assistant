import { constants } from '@tkww-assistant/utils';
import { parse, StylesheetNodeType } from 'scss-parser';
import query from 'query-ast';
import { languages, Disposable, workspace } from 'vscode';

const hover = (application: Instance.Application): Disposable => {
  const settings = () => workspace
    .getConfiguration(constants.configurationSection)
    .get<boolean>('hover');

  const provider = languages.registerHoverProvider(constants.supportedLanguageExt, {
    provideHover(document, position) {
      if (settings()) {
        const text = document
          .getText()
          .split('\n')
          [position.line];

        const property = query(parse<StylesheetNodeType>(text))()
          .find('declaration')
          .find('value')
          .find('identifier');

        if (property.length() > 0) {
          const variable = property.value();
          const found = application.dependencies
            .find('rule')
            .find('value')
            .find('identifier')
            .filter(({ node }) => node.value === variable.trim())
            .parents('rule')
            .find('from');

          let text = '';

          if (found.length() > 0) {
            for (let i = 0; i < found.length(); i += 1) {
              const node = found.eq(i);
              const value = node
                .value()
                .trim();
              text = `${text}${node.has('color_hex')
                .length() > 0 ? '#' : ''}`;
              text = `${text}${value}`;
              text = `${text}${i === found.length() - 2 ? ' or ' : ', '}`;
            }
            text = text.substring(0, text.length - 2);
            return {
              contents: [`This is the Union variable for ${text}.`],
            };
          }
        }
      }
    },
  });

  return provider;
};

export default hover;
