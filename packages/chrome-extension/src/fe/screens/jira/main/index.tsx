import { jira } from '@hooks';
import React, { Fragment, FunctionComponent } from 'react';
import { Logout } from '../../auth';
import Filters from './filters';
import Projects from './projects';

const Main: FunctionComponent = () => {
  const { logout } = jira.useAuthStatus();

  return (
    <Fragment>
      <Logout handleClickLogout={logout} />
      <Filters />
      <Projects />
    </Fragment>
  );
};

export default Main;
