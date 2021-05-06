import { Portal } from '@components/modal';
import { UnitProps } from '@components/unit';
import { github } from '@context';
import { GithubScreen } from '@screens';
import React, { FunctionComponent } from 'react';
import Wrapper from './wrapper';

const Github: FunctionComponent<UnitProps> = (props) => {
  const { isVisible } = props;

  return (
    <github.Provider>
      {isVisible && <Wrapper />}
      <Portal selectionTrigger="github">
        <GithubScreen />
      </Portal>
    </github.Provider>
  );
};

export default Github;
