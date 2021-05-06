import Unit from '@components/unit';
import React, { FunctionComponent } from 'react';
import { FaJira } from 'react-icons/fa';
import Router from './router';

const Wrapper: FunctionComponent = () => {
  return (
    <Unit.Container
      rightMargin
      column="first"
    >
      <Unit.Title
        text="Jira Issues"
        icon={FaJira}
      />
      <Router />
    </Unit.Container>
  );
};

export default Wrapper;
