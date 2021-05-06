import { jira } from '@hooks';
import React, { FunctionComponent } from 'react';
import { Login } from '../auth';
import Main from './main';

const Jira: FunctionComponent = () => {
  const { authStatus } = jira.useAuthStatus();

  if (authStatus === 'is') {
    return (
      <Main />
    );
  }

  return <Login unit="jira" />;
};

export default Jira;
