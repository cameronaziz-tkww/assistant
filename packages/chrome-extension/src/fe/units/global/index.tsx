import { Portal } from '@components/modal';
import { GlobalScreen } from '@screens';
import React, { FunctionComponent } from 'react';

const Global: FunctionComponent = () => {
  return (
    <Portal selectionTrigger="global">
      <GlobalScreen />
    </Portal>
  );
};

export default Global;
