import { TSESLint } from '@typescript-eslint/experimental-utils';
import hierarchicalImportOrder from '../../rules/hierarchical-import-order';
import { RecursivePartial } from '../../types';
import { MessageIds } from '../../util/messages';
import type { RuleOptions } from '../../util/hierarchicalImportOrder/types';

describe('hierarchical-import-order', () => {
  const tester = new TSESLint.RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
  });

  const inOrder = `\
import React from 'react';
import MembershipService from '@xo-union/sdk-membership';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { enhancedAnalyticsTracker } from '../lib/pacarana';
import { membershipApiKey } from '../settings';
import helpers from './helpers';
import reducers from './redux';
import styles from '../styles.scss';

const value = 'something'; // need another node to trail imports
`;

  const inOrderIgnoreCases = `\
import helpers from '../helpers';
import VendorClass from '../VendorClass';

const value = 'something'; // need another node to trail imports
`;

  const dontTouchLaterImports = `\
import helpers from '../helpers';
import utils from '../utils';

const value = 'something'; // need another node to trail imports

import thunk from 'redux-thunk';
`;

  const justForCoverage = `\
import helpers from 'react';
import VendorClass from 'react';

const value = 'something'; // need another node to trail imports
`;

  const outOfOrderIgnoreCases = `\
import VendorClass from '../VendorClass';
import helpers from '../helpers';

const value = 'something'; // need another node to trail imports
`;

  const inOrderReactNotFirst = `\
import MembershipService from '@xo-union/sdk-membership';
import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { enhancedAnalyticsTracker } from '../lib/pacarana';
import { membershipApiKey } from '../settings';
import helpers from './helpers';
import reducers from './redux';
import styles from '../styles.scss';

const value = 'something'; // need another node to trail imports
`;

  const inOrderIgnoreAt = `\
import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import MembershipService from '@xo-union/sdk-membership';
import { enhancedAnalyticsTracker } from '../lib/pacarana';
import { membershipApiKey } from '../settings';
import helpers from './helpers';
import reducers from './redux';
import styles from '../styles.scss';

const value = 'something'; // need another node to trail imports
`;

  const inOrderStylesNotLast = `\
import React from 'react';
import MembershipService from '@xo-union/sdk-membership';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { enhancedAnalyticsTracker } from '../lib/pacarana';
import { membershipApiKey } from '../settings';
import styles from '../styles.scss';
import helpers from './helpers';
import reducers from './redux';

const value = 'something'; // need another node to trail imports
`;

  const outOfOrder = `\
import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import MembershipService from '@xo-union/sdk-membership';
import thunk from 'redux-thunk';
import { enhancedAnalyticsTracker } from '../lib/pacarana';
import { membershipApiKey } from '../settings';
import styles from '../styles.scss';
import helpers from './helpers';
import reducers from './redux';

const value = 'something'; // need another node to trail imports
`;

  const outOfOrderWithComments = `\
import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
/** Members Area */ import MembershipService from '@xo-union/sdk-membership';
import thunk from 'redux-thunk';
import { enhancedAnalyticsTracker } from '../lib/pacarana'; // The Logger
import { membershipApiKey } from '../settings';
import styles from '../styles.scss';
import helpers from './helpers';
import reducers from './redux';

const value = 'something'; // need another node to trail imports
`;

  const inOrderWithComments = `\
import React from 'react';
/** Members Area */ import MembershipService from '@xo-union/sdk-membership';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { enhancedAnalyticsTracker } from '../lib/pacarana'; // The Logger
import { membershipApiKey } from '../settings';
import helpers from './helpers';
import reducers from './redux';
import styles from '../styles.scss';

const value = 'something'; // need another node to trail imports
`;

  tester.run<MessageIds<'hierarchical-import-order'>, RecursivePartial<RuleOptions>>(
    'tkww-assistant/hierarchical-import-order',
    hierarchicalImportOrder,
    {
      valid: [
        {
          code: inOrder,
        },
        {
          code: inOrderWithComments,
        },
        {
          code: justForCoverage,
        },
        {
          code: dontTouchLaterImports,
        },
      ],
      invalid: [
        {
          code: outOfOrder,
          errors: [
            {
              messageId: 'shouldMove',
              data: {
                problemSpecifier: 'redux',
                targetSpecifier: 'redux-thunk',
                direction: 'after',
              },
            },
            {
              messageId: 'atEnd',
              data: {
                problemSpecifier: '../styles.scss',
              },
            },
          ],
          output: inOrder,
        },
        {
          code: outOfOrderWithComments,
          errors: [
            {
              messageId: 'shouldMove',
              data: {
                problemSpecifier: 'redux',
                targetSpecifier: 'redux-thunk',
                direction: 'after',
              },
            },
            {
              messageId: 'atEnd',
              data: {
                problemSpecifier: '../styles.scss',
              },
            },
          ],
          output: inOrderWithComments,
        },
      ],
    },
  );

  tester.run<MessageIds<'hierarchical-import-order'>, RecursivePartial<RuleOptions>>(
    'tkww-assistant/hierarchical-import-order',
    hierarchicalImportOrder,
    {
      valid: [
        {
          code: inOrderStylesNotLast,
          options: [
            {
              styleAlwaysLast: false,
            },
          ],
        },
      ],
      invalid: [
        {
          code: inOrder,
          errors: [
            {
              messageId: 'shouldMove',
              data: {
                problemSpecifier: '../styles.scss',
                targetSpecifier: './helpers',
                direction: 'before',
              },
            },
          ],
          options: [
            {
              styleAlwaysLast: false,
            },
          ],
          output: inOrderStylesNotLast,
        },
      ],
    },
  );

  tester.run<MessageIds<'hierarchical-import-order'>, RecursivePartial<RuleOptions>>(
    'tkww-assistant/hierarchical-import-order',
    hierarchicalImportOrder,
    {
      valid: [
        {
          code: inOrderReactNotFirst,
          options: [
            {
              reactAlwaysFirst: false,
            },
          ],
        },
      ],
      invalid: [
        {
          code: inOrder,
          errors: [
            {
              messageId: 'shouldMove',
              data: {
                problemSpecifier: 'react',
                targetSpecifier: 'redux',
                direction: 'after',
              },
            },
          ],
          options: [
            {
              reactAlwaysFirst: false,
            },
          ],
          output: inOrderReactNotFirst,
        },
      ],
    },
  );

  tester.run<MessageIds<'hierarchical-import-order'>, RecursivePartial<RuleOptions>>(
    'tkww-assistant/hierarchical-import-order',
    hierarchicalImportOrder,
    {
      valid: [
        {
          code: inOrderIgnoreAt,
          options: [
            {
              ignoreLeadingAt: true,
            },
          ],
        },
      ],
      invalid: [
        {
          code: inOrder,
          errors: [
            {
              messageId: 'shouldMove',
              data: {
                problemSpecifier: '@xo-union/sdk-membership',
                targetSpecifier: '../lib/pacarana',
                direction: 'after',
              },
            },
          ],
          options: [
            {
              ignoreLeadingAt: true,
            },
          ],
          output: inOrderIgnoreAt,
        },
      ],
    },
  );

  tester.run<MessageIds<'hierarchical-import-order'>, RecursivePartial<RuleOptions>>(
    'tkww-assistant/hierarchical-import-order',
    hierarchicalImportOrder,
    {
      valid: [
        {
          code: inOrderIgnoreCases,
          options: [
            {
              ignoreCases: true,
            },
          ],
        },
        {
          code: outOfOrderIgnoreCases,
          options: [
            {
              ignoreCases: false,
            },
          ],
        },
      ],
      invalid: [
        {
          code: inOrderIgnoreCases,
          errors: [
            {
              messageId: 'atEnd',
              data: {
                problemSpecifier: '../helpers',
              },
            },
          ],
          options: [
            {
              ignoreCases: false,
            },
          ],
          output: outOfOrderIgnoreCases,
        },
      ],
    },
  );
});
