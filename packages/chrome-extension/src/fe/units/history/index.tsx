import { UnitProps } from '@components/unit';
import { history } from '@context';
import React, { FunctionComponent } from 'react';
import Wrapper from './wrapper';

const History: FunctionComponent<UnitProps> = (props) => {
  const { isVisible } = props;

  return (
    <history.Provider>
      {isVisible && <Wrapper />}
    </history.Provider>
  );
};

export default History;
