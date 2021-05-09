import { history } from '@context';
import React, { FunctionComponent } from 'react';
import Wrapper from './wrapper';

const History: FunctionComponent = () => {
  return (
    <history.Provider>
      <Wrapper />
    </history.Provider>
  );
};

export default History;
