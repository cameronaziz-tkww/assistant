import hierarchicalImportOrder from './hierarchical-import-order';
import lodashNamedImports from './lodash-named-imports';
import memberDelimiterStyle from './member-delimiter-style';
import reduxActionCreatorDefinitions from './redux-action-creator-definitions';
import reduxActionCreatorFilenames from './redux-action-creator-filenames';
import reduxActionCreatorReturn from './redux-action-creator-return';
import reduxActionCreatorType from './redux-action-creator-type';
import reduxActionTypes from './redux-action-types';
import reduxNamespaceMembers from './redux-namespace-members';
import reduxStateFileNaming from './redux-state-file-naming';
import reduxStateStatements from './redux-state-statements';
import reduxThunksNoDefaultExport from './redux-thunks-no-default-export';
import reduxThunksReturnType from './redux-thunks-return-type';
import reduxThunksShouldDispatch from './redux-thunks-should-dispatch';
import tupleSpacing from './tuple-spacing';
import typeDeclarationLength from './type-declaration-length';
import typeDefinitionDelimiterStyle from './type-definition-delimiter-style';
import typeDelimiterStyle from './type-delimiter-style';

const rules = {
  'hierarchical-import-order': hierarchicalImportOrder,
  'lodash-named-imports': lodashNamedImports,
  'member-delimiter-style': memberDelimiterStyle,
  'redux-action-creator-definitions': reduxActionCreatorDefinitions,
  'redux-action-creator-filenames': reduxActionCreatorFilenames,
  'redux-action-creator-return': reduxActionCreatorReturn,
  'redux-action-creator-type': reduxActionCreatorType,
  'redux-action-types': reduxActionTypes,
  'redux-state-statements': reduxStateStatements,
  'redux-state-file-naming': reduxStateFileNaming,
  'redux-thunks-no-default-export': reduxThunksNoDefaultExport,
  'redux-thunks-return-type': reduxThunksReturnType,
  'redux-thunks-should-dispatch': reduxThunksShouldDispatch,
  'redux-namespace-members': reduxNamespaceMembers,
  'tuple-spacing': tupleSpacing,
  'type-declaration-length': typeDeclarationLength,
  'type-definition-delimiter-style': typeDefinitionDelimiterStyle,
  'type-delimiter-style': typeDelimiterStyle,
};

export default rules;
