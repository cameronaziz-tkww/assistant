import { Node, ValueType } from 'query-ast';
import { Constants, Dependency } from '.';

/** @constant
    @type {string[]} - The supported language IDs.
    @default
*/
const supportedLanguageExt: string[] = [
  'scss',
  'css',
  'sass',
];

/** @constant
    @type {string} - The supported language IDs in glob form.
    @default
*/
const supportedLanguageExtGlob: string = `{${supportedLanguageExt.join(',')}}`;

/** @constant
    @type {Constants.NumberFactor} - Conversions between different identifiers.
    @default
*/
const identifierConversions: Constants.NumberFactor = {
  'rem': 1,
  'px': 16,
  'pt': 12,
};

const configurationSection = 'TKWW Assistant';
const slackURL = 'https://theknotww.slack.com/archives/C01E4Q8T10R';

const dependencyVersions: Dependency.DependencyVersion[] = [
  {
    dependencyName: 'tk-css-spacing',
    dependencyOrganization: 'xo-union',
    versionRange: '>=3 <4',
  },
  {
    dependencyName: 'tk-ui-colors',
    dependencyOrganization: 'xo-union',
    versionRange: '>=3 <4',
  },
];

const dependencyNames: Dependency.DependencyName[] = dependencyVersions
  .map(({ dependencyName, dependencyOrganization, versionRange}) => ({
    dependency: `${dependencyOrganization ? `@${dependencyOrganization}/` : ''}${dependencyName}`,
    versionRange,
  }));

const space: Node<ValueType> = {
  type: 'space',
  value: ' ',
};

const newLine: Node<ValueType> = {
  type: 'space',
  value: '\n',
};

const lineBreak: Node<ValueType> = {
  type: 'space',
  value: '\n\n',
};

const semicolon: Node<ValueType> = {
  type: 'punctuation',
  value: ';',
};

const comma: Node<ValueType> = {
  type: 'punctuation',
  value: ',',
};

const atKeyword: Node<ValueType> = {
  type: 'atkeyword',
  value: 'value',
};

const fromNode: Node<ValueType> = {
  type: 'identifier',
  value: 'from',
};

const important: Node<ValueType> = {
  type: 'identifier',
  value: 'important'
};

const exclamation: Node<ValueType> = {
  type: 'operator',
  value: '!'
};

interface Nodes {
  space: Node<ValueType>
  newLine: Node<ValueType>
  lineBreak: Node<ValueType>
  semicolon: Node<ValueType>
  comma: Node<ValueType>
  atKeyword: Node<ValueType>
  fromNode: Node<ValueType>
  important: Node<ValueType>
  exclamation: Node<ValueType>
}

const nodes: Nodes = {
  space,
  newLine,
  lineBreak,
  semicolon,
  comma,
  atKeyword,
  fromNode,
  important,
  exclamation,
};

export default {
  nodes,
  dependencyNames,
  configurationSection,
  identifierConversions,
  slackURL,
  supportedLanguageExt,
  supportedLanguageExtGlob,
};
