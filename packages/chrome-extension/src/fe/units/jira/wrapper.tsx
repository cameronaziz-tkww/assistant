import Search from '@components/input/search';
import Unit from '@components/unit';
import React, { Fragment, FunctionComponent } from 'react';
import { FaJira } from 'react-icons/fa';
import Router from './router';

const Wrapper: FunctionComponent = () => {
  return (
    <Fragment>
      <Unit.Title
        align="left"
        text="Jira Issues"
        icon={FaJira}
        sideNode={<Search />}

      />
      <Router />
    </Fragment>
  );
};

export default Wrapper;
