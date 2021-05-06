import Login from '@components/login';
import { useAuthCheck, useInit } from '@hooks/jira';
import React, { FunctionComponent, useEffect } from 'react';
import Content from './content';

const Router: FunctionComponent = () => {
  const { init } = useInit();
  const { check, authStatus } = useAuthCheck();

  useEffect(
    () => {
      check();
      init('settings');
    },
    [],
  );

  switch (authStatus) {
    case 'waiting': return null;
    case 'not': return <Login column="first" unit="jira" />;
    default: return <Content />;
  }
};

export default Router;
