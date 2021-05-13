import Unit from '@components/unit';
import React, { Fragment, FunctionComponent } from 'react';
import { FaJira } from 'react-icons/fa';
import Router from './router';

const Wrapper: FunctionComponent = () => {
  return (
    <Fragment>
      <Unit.Title
        text="Jira Issues"
        icon={FaJira}
      />
      <Router />
    </Fragment>
  );
};

export default Wrapper;
