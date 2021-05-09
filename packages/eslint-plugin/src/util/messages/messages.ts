/* eslint-disable max-len */

const messages = {
  'eslint-schema-valid': {
    schemaIsInvalid: 'eslint-schema-valid',
  },
  'lodash-named-imports': {
    namedImport: 'Lodash named import found',
  },
  'member-delimiter-style': {
    expected: 'Expected a {{ delimiter }} to follow member',
    unexpected: 'Unexpected {{ delimiter }} separator was found after member',
  },
  'type-definition-delimiter-style': {
    expected: 'Expected a {{ delimiter }} to follow declaration',
    unexpected: 'Unexpected {{ delimiter }} separator was found after declaration',
  },
  'redux-action-creator-filenames': {
    onlyOneDeclaration: 'Action creator type declaration files should only declare one namespace. {{ memberCount }} members were found.',
    shouldDeclare: 'Should be a module declaration, use \'declare\' instead of \'export\'',
    notIdentifier: 'Module declaration should use an Identifier instead of a Literal',
    incorrectFilename: 'The \'{{ namespace }}\' namespace is in incorrect parent folder \'{{ moduleFolder }}\'',
  },
  'hierarchical-import-order': {
    shouldMove: 'Import of \'{{ problemSpecifier }}\' should come {{ direction }} \'{{ targetSpecifier }}\'',
    atEnd: 'Import of \'{{ problemSpecifier }}\' should be the last import',
  },
  'redux-action-creator-return': {
    outsideNamespace: 'ActionTypes contains member that has a return reference outside of the {{ expectedNamespace }} namespace - reference {{ member }}',
    missingReturnType: 'Action Creator is missing a return type',
  },
  'redux-action-creator-type': {
    badTypeValue: 'Action creators type property value is incorrect - Received {{ value }}, Expected {{ expectedValue }}',
    badTypeValueModule: 'Action creators type property module piece is incorrect - Received {{ module }}, Expected {{ expectedModule }}',
    badTypeValueName: 'Action creators type property name piece is incorrect - Received {{ name }}, Expected {{ expectedName }}',
    noTypeValue: 'Action creator {{ value }} is missing a type property - expected \'{{ expectedValue }}\'',
    typeValueNotString: 'Action creators type values must be a string',
  },
  'redux-action-creator-definitions': {
    extraMember: 'Extra member',
    noExports: 'ActionCreators has no exports',
    nonExportedMember: 'ActionCreators should not have unexported members',
    badExport: 'ActionCreators should not export non action creators',
    noTypeValue: 'Action creator {{ value }} is missing a type property - expected \'{{ expectedValue }}\'',
    badTypeValue: 'Action creators type property value is incorrect - Received {{ value }}, Expected {{ expectedValue }}',
    badTypeValueModule: 'Action creators type property module piece is incorrect - Received {{ module }}, Expected {{ expectedModule }}',
    badTypeValueName: 'Action creators type property name piece is incorrect - Received {{ name }}, Expected {{ expectedName }}',
    typeValueNotString: 'Action creators type values must be a string',
  },
  'redux-action-types': {
    nonTypeReference: 'ActionTypes contains non TypeReference',
    outsideNamespace: 'ActionTypes contains member {{ member }} with reference outside of the {{ expectedNamespace }} namespace',
    missingActionCreator: 'ActionTypes member {{ member }} was not found in the ActionCreators namespace',
    missingActionType: 'ActionCreators member {{ member }} was not found in the ActionTypes union',
  },
  'redux-namespace-members': {
    noCorrectExport: '{{ exportName }} {{ exportType }} should exist and be exported',
    extraDefinition: '{{ module }} has an extra member {{ member }}',
    extraDefinitionUnknown: 'Unknown member found in {{ module }}',
    extraExport: '{{ module }} has an extra exported member {{ member }}',
    extraExportUnknown: 'Unknown exported member found in {{ module }}',
    notExported: '{{ exportName }} {{ exportType }} should be exported',
    notUnion: 'ActionTypes should be a union type',
    missingExport: '{{ module }} is missing {{ member }}',
  },
  'camelcase': {
    notCamelCase: 'Identifier \'{{name}}\' is not in camel case.',
  },
  'max-classes-per-file': {
    maximumExceeded: 'File has too many classes ({{ classCount }}). Maximum allowed is {{ max }}.',
  },
  'tuple-spacing': {
    tooManyBreaks: 'Member has incorrect leading leading line breaks',
    indentWrong: 'Member has incorrect indent spacing',
    leadingSpacing: 'Member has incorrect leading spacing',
    trailingSpacing: 'Member has incorrect trialing spacing',
    incorrectSpacing: 'Your spacing is wrong',
  },
  'type-delimiter-style': {
    unexpectedComma: 'Unexpected separator (,).',
    unexpectedSemi: 'Unexpected separator (;).',
    expectedComma: 'Expected a comma.',
    expectedSemi: 'Expected a semicolon.',
  },
  'type-declaration-length': {
    tooLong: 'This {{ declarationType }} declaration is has a length of {{ widest }}. Maximum allowed is {{ maxLength }}.',
    shouldBreak: 'This {{ declarationType }} declaration should be broken into multiple lines.',
    breakOneBreakAll: 'This {{ declarationType }} is partially split into multiple lines.',
    consistentBreaks: 'This {{ declarationType }} is does not have consistent line breaks.',
    consistentSpacing: 'This {{ declarationType }} is does not have consistent spacing.',
  },
  'redux-state-file-naming': {
    fileInSubdirectory: 'All type files should be in the root level of the redux folder - this file is in a subdirectory.',
    badFilename: 'This state file should only be {{ moduleNameRaw }}.ts - {{ file }} was found{{ help }}',
    nonTSFile: 'This directory is reserved for Typescript files only - a {{ extension }} extension was found',
  },
  'redux-state-statements': {
    additionalStatement: 'This state file should only have statement named {{ moduleName }} - move to or create {{ moduleName }} namespace',
    badTypescript: 'Type imports can only be on named imports or default, not both. smh',
    badExport: 'This state file files should only have one export - expected {{ moduleName }}, received {{ exportName }}',
    importValue: 'State files are type only files, imports should be types not values - try \'{{ suggestion }}\'',
  },
  'redux-thunks': {
    returnFunction: 'Thunk should return functions',
    additionalStatement: 'Thunk files shouldn\'t have additional statements',
    additionalExport: 'Thunk files shouldn\'t have additional exports',
    noReturnType: 'Thunks need a return type as Redux.ThunkResult<T>',
    outsideNamespace: 'Thunk returns a type from the {{ member }} namespace - expected {{ expectedNamespace }} namespace',
  },
  'redux-thunks-return-type': {
    returnFunction: 'Thunk should return functions',
    noReturnType: 'Thunks need a return type as Redux.ThunkResult<T>',
    outsideNamespace: 'Thunk returns a type from the {{ member }} namespace - expected {{ expectedNamespace }} namespace',
  },
  'redux-thunks-should-dispatch': {
    noDispatchParameter: 'Dispatch should not be passed to another function and only called from thunk',
    dispatchReassigned: 'Dispatch should not be reassigned. This can get very confusing.',
    dispatchNotCalled: 'Thunks should dispatch, ensure you call the parameter \'{{ parameterName }}\'',
    dispatchUsedAsParameter: 'Dispatch should never be taken out of the thunk scope',
  },
  'redux-thunks-no-default-export': {
    noDefaultExport: 'Thunk files should not have a default export',
  },
} as const;

export default messages;
