/* eslint-disable max-len */
import type messages from './messages';

type NestedMessages<T extends keyof typeof messages, U extends keyof typeof messages[T]> = {
  [message in U as `punny-${string & message}`]?: string;
};

type PunnyMessages = {
  [key in keyof typeof messages]?: NestedMessages<key, keyof typeof messages[key]>;
};

const punnyMessages: PunnyMessages = {
  'redux-action-creator-filenames': {
    'punny-shouldDeclare': 'Declare it to the world! Use \'declare\' instead of \'export\'',
    'punny-notIdentifier': 'Module declaration should literally use an Identifier instead of identifying it as a Literal',
    'punny-incorrectFilename': 'Ok, I\'m lost. The \'{{ namespace }}\' namespace is in incorrect parent folder \'{{ moduleFolder }}\'',
  },
  'redux-action-creator-return': {
    'punny-missingReturnType': 'Action Creator is missing a return type. I just want know what I\'m going to be getting.',
  },
  'redux-action-creator-type': {
    'punny-typeValueNotString': 'Action creators type values must be a string - this should be a relationship with strings attached',
  },
  'redux-action-creator-definitions': {
    'punny-typeValueNotString': 'Action creators type values must be a string - this should be a relationship with strings attached',
  },
  'camelcase': {
    'punny-notCamelCase': 'Identifier \'{{name}}\' is not in camelCase.',
  },
  'max-classes-per-file': {
    'punny-maximumExceeded': 'Woah don\'t be so classy! This file has too many classes ({{ classCount }}). Maximum allowed is {{ max }}.',
  },
  'tuple-spacing': {
    'punny-incorrectSpacing': 'Yourspacing           iswrong',
  },
};

export default punnyMessages;
