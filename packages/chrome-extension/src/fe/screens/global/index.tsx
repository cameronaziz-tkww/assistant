import React, { Fragment, FunctionComponent } from 'react';
import Filters from './filters';
import Units from './units';

const Global: FunctionComponent = () => {
  return (
    <Fragment>
      <Units />
      <Filters />
    </Fragment >
  );
};

export default Global;
