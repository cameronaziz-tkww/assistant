import type * as Types from '../types';

export const PLUGIN_NAME = '@tkww-assistant/eslint-plugin';
export const GLOBAL_SCHEMA_OPTION = {
  type: 'object',
  properties: {
    projectRoot: {
      type: 'string',
    },
  },
  additionalProperties: false,
};

export const RULE = {
  type: 'object',
  properties: {
    excludeDefault: {
      type: 'boolean',
    },
    runOn: {
      type: 'object',
      properties: {
        include: {
          oneOf: [
            {
              type: 'array',
              items: {
                type: 'string',
              },
              additionalItems: false,
            },
            {
              type: 'string',
            },
          ],
        },
        ignore: {
          oneOf: [
            {
              type: 'array',
              items: {
                type: 'string',
              },
              additionalItems: false,
            },
            {
              type: 'string',
            },
          ],
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

export const RULE_SCHEMA_OPTION = {
  type: 'object',
  properties: {
    noStrings: {
      type: 'boolean',
    },
    allowedStrings: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'string',
      },
    },
    ignoreProps: {
      type: 'boolean',
    },
    noAttributeStrings: {
      type: 'boolean',
    },
  },
  additionalProperties: false,
};

export const BASE_RULE_SCHEMA = [
  RULE_SCHEMA_OPTION,
  GLOBAL_SCHEMA_OPTION,
];

export const FILE_LOCATION_GLOBS: Types.FileLocations = {
  actionCreatorDefinitions: {
    ruleType: 'redux-project-roots',
    match: [
      'types/*/actionCreators.d.ts',
    ],
  },
  eslintSchemaValid: {
    ruleType: 'eslint-rules-roots',
    match: [
      '**/rules/*',
    ],
    ignore: [
      '**/tests/rules/**/*',
    ],
  },
  actionCreators: {
    ruleType: 'redux-project-roots',
    match: [
      'client/redux/*/**/actionCreators.ts',
      'client/redux/*/**/actionCreators/**/*.ts',
    ],
    ignore: [
      '**/*.test.ts',
    ],
  },
  state: {
    ruleType: 'redux-project-roots',
    match: [
      'types/redux/**/*',
    ],
    ignore: [
      'types/redux/actionTypes.ts',
      'types/redux/index.d.ts',
    ],
  },
  goodState: {
    ruleType: 'redux-project-roots',
    match: [
      'types/redux/*',
    ],
    ignore: [
      'types/redux/actionTypes.ts',
      'types/redux/index.d.ts',
    ],
  },
  thunks: {
    ruleType: 'redux-project-roots',
    match: [
      'client/redux/*/thunks.ts',
      'client/redux/*/actions/thunks.ts',
      'client/redux/*/actions/thunks/**/*.ts',
    ],
  },
  thunksDispatch: {
    ruleType: 'redux-project-roots',
    match: [
      'client/redux/**/thunks.js',
      'client/redux/**/*',
      'client/redux/**/thunks.ts',
      'client/redux/**/actions/thunks.ts',
      'client/redux/**/actions/thunks.js',
      'client/redux/**/actions/thunks/**/*',
    ],
  },
};

export const BASE_FILE_LOCATION: Types.FileLocation = {
  ruleType: 'redux-project-roots',
  match: [],
};
