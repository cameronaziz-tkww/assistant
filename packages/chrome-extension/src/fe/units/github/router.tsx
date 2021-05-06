import Login from '@components/login';
import { useAuthCheck, useInit } from '@hooks/github';
import React, { FunctionComponent, useEffect } from 'react';
import Content from './content';

const Router: FunctionComponent = () => {
  const { check, authStatus } = useAuthCheck();
  const { init } = useInit();

  useEffect(
    () => {
      init('pullRequests');
      init('settings');
      init('repositories');
    },
    [],
  );

  useEffect(
    () => {
      const hangup = check();

      return () => {
        hangup();
      };
    },
    [],
  );

  switch (authStatus) {
    case 'waiting': return null;
    case 'not': return <Login column="third" unit="github" />;
    default: return <Content />;
  }
};

export default Router;
