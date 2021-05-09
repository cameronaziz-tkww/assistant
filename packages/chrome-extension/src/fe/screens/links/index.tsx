import React, { Fragment, FunctionComponent } from 'react';
import CustomLinks from './customLinks';
import StandardLinks from './standardLinks';

const Main: FunctionComponent = () => {
  return (
    <Fragment>
      {/* <Reorder /> */}
      <CustomLinks />
      <StandardLinks />
    </Fragment>
  );
};

export default Main;
