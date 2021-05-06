import { github, modal } from '@hooks';
import React, { FunctionComponent } from 'react';
import { Login } from '../auth';
import Main from './main';

const Github: FunctionComponent = () => {
  const { authStatus } = github.useAuthStatus();
  const { selection } = modal.useSelection();

  if (selection !== 'github') {
    return null;
  }

  if (authStatus === 'is') {
    return (
      <Main />
    );
  }

  return <Login unit="github" />;
};

export default Github;
