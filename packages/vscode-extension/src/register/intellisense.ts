import { utils, newRule, getImportLocation } from '@tkww-assistant/atrules';
import { SchemaNodeType } from '@tkww-assistant/dependencies';
import { constants, parseDocument, validCSS, recurseHas, accessors } from '@tkww-assistant/utils';
import { stringify, parse, StylesheetNodeType } from 'scss-parser';
import query, { Node, QueryWrapper, NodeWrapper, ValueType } from 'query-ast';
import {
  languages,
  CompletionItemKind,
  CompletionItem,
  Disposable,
  TextEdit,
  Range,
  TextDocument,
  workspace,
} from 'vscode';

type CSSValueType = 'css-values' | 'data-type' | 'name' | 'ast' | ValueType

const intellisense = (application: Instance.Application): Disposable => {
  const queryCSSValues = query<CSSValueType>(validCSS.valueAST)()
    .find('data-type');

  const getKind = (fromQuerySelector: QueryWrapper<SchemaNodeType>) => {
    if (fromQuerySelector.has('color_hex').length() > 0) {
      return CompletionItemKind.Color;
    }
    if (fromQuerySelector.has('number').length() > 0) {
      return CompletionItemKind.Value;
    }
    return CompletionItemKind.Text;
  };

  const settings = () => workspace
    .getConfiguration(constants.configurationSection)
    .get('intellisense');

  const additionalTextEdits = (identifier: QueryWrapper<SchemaNodeType>, document: TextDocument) => {
    const clientWrapper = parseDocument<StylesheetNodeType>(document.getText());
    if (!clientWrapper) {
      return [];
    }

    const atRulesWrapper = utils.getAtValueRules(clientWrapper);

    const currentImported = atRulesWrapper
      .find(({ node }) => node.type === 'identifier' && node.value === identifier.value());

    if (currentImported.length() > 0) {
      return [];
    }

    const dependencyName = getImportLocation(identifier);
    const importedRule = atRulesWrapper
      .find(({ node }) => node.type === 'string_double' || node.type === 'string_single')
      .filter(({ node }) => node.value === dependencyName)
      .parents('atrule');

    if (importedRule.length() === 0) {
      const rule = newRule(dependencyName, identifier as QueryWrapper<ValueType>);
      const ruleText = stringify(rule);
      const range = new Range(0, 0, 0, 0);
      const textEdit = new TextEdit(range, ruleText);
      return [textEdit];
    }

    const variablesWithSpace = utils.getDirtyVariables(importedRule)
    const maybeLastItem = variablesWithSpace.eq(variablesWithSpace.length() - 2);

    const lastItemIsNotSpace = maybeLastItem
      .filter(({ node }) => node.type === 'space')
      .length() === 0;

    const lastItem = lastItemIsNotSpace ? maybeLastItem : maybeLastItem.prev();

    const updatedVariables = lastItem
      .after(identifier.get(0) as Node<ValueType>)
      .after(constants.nodes.space)
      .after(constants.nodes.comma)

    const updatedRule = updatedVariables
      .parents('atrule')
      .get(0);

    if (updatedRule.start) {
      const ruleText = stringify(updatedRule);
      const line = updatedRule.start.line - 1;
      const range = new Range(line, 0, line, Number.MAX_SAFE_INTEGER);
      const textEdit = new TextEdit(range, ruleText);
      return [textEdit];
    }

    return [];
  };

  const provider = languages.registerCompletionItemProvider(constants.supportedLanguageExt, {
    provideCompletionItems(document, position) {
      const completionList: CompletionItem[] = [];

      if (settings()) {
        // The given line being edited.
        const text = document
          .getText()
          .split('\n')
          [position.line];

        // Parse the text, convert to AST query, get the value before the colon in a string.
        const property = query(parse<StylesheetNodeType>(text))()
          .find(({ node }) => node.type === 'punctuation' && node.value === ':')
          .prevAll()
          .value()
          .trim();

        const cssData = validCSS.cssValue(property);

        if (cssData) {
          const definitions = queryCSSValues
            .find(({ node }) => node.type === 'name' && cssData.values.includes(node.value as string))
            .parent()
            .find('ast');

        const suggestionRules = application.dependencies
          .find('rule')
          .find('from')
          .filter((wrapper) => {
            if (wrapper.hasChildren) {
              return recurseHas.childValue({
                queryWrapper: definitions,
                hasArray: wrapper.children as NodeWrapper<CSSValueType>[],
                excludedValues: ['any']
              }).length() > 0
            }
            return false
          })
          .parent();

          for (let i = 0; i < suggestionRules.length(); i += 1) {
            const suggestion = suggestionRules.eq(i);


            const identifier = suggestion
              .find('value')
              .find('identifier');
            const from = suggestion
              .find('from');

            const identifierValue = identifier.value().trim();

            const terms = application.dependencies
              .find('rule')
              .find('value')
              .filter(({ node }) => {
                const nodeQuery = query(node)();
                const nodeValue = nodeQuery.value().trim();
                if (nodeValue === identifierValue) {
                  return true;
                }
                return false;
              })
              .parent('rule')
              .find('from')
              .map(({ node }) => {
                const nodeQuery = query(node)();
                const lead = nodeQuery.has('color_hex').length() > 0 ? '#' : '';
                const value = nodeQuery.value().trim();
                return `${lead}${value}`;
              });

            const completion = new CompletionItem(identifier.value());
            completion.detail = `CSS Union for ${accessors.changeValue(terms)}`;
            completion.kind = getKind(from);
            completion.additionalTextEdits = additionalTextEdits(identifier, document);
            completionList.push(completion);
          }
          return completionList;
        }
      }

      return completionList;
    },
  });

  return provider;
};

export default intellisense;
