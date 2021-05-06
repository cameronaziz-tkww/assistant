import { Portal } from '@components/modal';
import { UnitProps } from '@components/unit';
import { honeybadger } from '@context';
import { HoneyBadgerScreen } from '@screens';
import React, { FunctionComponent } from 'react';
import UI from './ui';

const Honeybadger: FunctionComponent<UnitProps> = (props) => {
  const { isVisible } = props;

  return (
    <honeybadger.Provider>
      {isVisible &&
        <UI />
      }
      <Portal selectionTrigger="honeybadger">
        <HoneyBadgerScreen />
      </Portal>
    </honeybadger.Provider>
  );
};

export default Honeybadger;
