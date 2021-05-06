import React, { Fragment, FunctionComponent } from 'react';
import Monitors from './monitors';
import Projects from './projects';

const Global: FunctionComponent = () => {
  return (
    <Fragment>
      <Projects />
      <Monitors />
    </Fragment >
  );
};

export default Global;
