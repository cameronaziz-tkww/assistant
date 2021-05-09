import * as Types from './types';

export const getDelimiter = (declarationType: Types.DeclarationType): Types.Delimiter => {
  switch(declarationType) {
    case 'intersection': return '&';
    case 'union': return '|';
    case 'tuple': return ',';
    default: throw new Error('Nope');
  }
};

export const addBefore = (delimiter: Types.Delimiter): string => {
  switch(delimiter) {
    case ',':
      return '';
    default:
      return delimiter;
  }
};

export const getIndent = (indentWith: Types.IndentWith): string => {
  switch(indentWith) {
    case 'spaces': return ' ';
    case 'tabs': return '\t';
    default: throw new Error('You Goofed: getIndent');
  }
};

export const allowable = {
  ends: [
    '>',
    ';',
    ')',
  ],
  next: [
    ',',
    ';',
  ],
};
