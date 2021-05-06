import Unit from '@components/unit';
import React, { FunctionComponent } from 'react';
import { DiGithubBadge } from 'react-icons/di';
import Router from './router';

const Wrapper: FunctionComponent = () => {

  return (
    <Unit.Container
      leftMargin
      column="third"
    >
      <Unit.Title
        text="GitHub Pull Requests"
        icon={DiGithubBadge}
      />
      <Router />
    </Unit.Container>
  );
};

export default Wrapper;
